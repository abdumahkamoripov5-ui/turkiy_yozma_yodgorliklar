import re
from collections import Counter

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, NumberFilter, CharFilter
from django.db.models import F, Q, Sum, Count
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.utils import timezone

from .models import Monument, MonumentSubmission, SiteSettings
from .serializers import (
    MonumentListSerializer, MonumentDetailSerializer,
    MonumentSubmissionSerializer, SiteSettingsSerializer,
)
from .throttling import ScopedRateThrottle
from .word_tr import WORD_TR


# ── Filters ───────────────────────────────────────────────────────────────────

class MonumentFilter(FilterSet):
    year_min  = NumberFilter(field_name='year', lookup_expr='gte')
    year_max  = NumberFilter(field_name='year', lookup_expr='lte')
    script    = CharFilter(field_name='script', lookup_expr='iexact')
    category  = CharFilter(field_name='category', lookup_expr='iexact')
    featured  = CharFilter(method='filter_featured')

    def filter_featured(self, qs, name, value):
        return qs.filter(featured=(value.lower() == 'true'))

    class Meta:
        model  = Monument
        fields = ['script', 'category', 'language', 'featured', 'year_min', 'year_max']


# ── Custom JWT — username ni javobga qo'shish ─────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['is_staff']  = self.user.is_staff
        # Sayt orqali muvaffaqiyatli kirishni tarixga yozish
        # (muvaffaqiyatsizlari user_login_failed signali orqali o'zi yoziladi)
        from .signals import record
        record(self.context.get('request'), 'login', user=self.user)
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ── Monument ViewSet ──────────────────────────────────────────────────────────

class MonumentViewSet(viewsets.ModelViewSet):
    queryset = Monument.objects.filter(status='Chop etilgan').order_by('year')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MonumentFilter
    search_fields   = ['title', 'description', 'location', 'transliteration', 'translation']
    ordering_fields = ['year', 'views', 'title', 'importance', 'word_count']
    ordering        = ['year']

    def get_serializer_class(self):
        if self.action in ('list', 'featured'):
            return MonumentListSerializer
        return MonumentDetailSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'featured', 'stats', 'concordance', 'word_frequency'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # F() — bir vaqtdagi so'rovlarda ko'rishlar yo'qolmasligi uchun (bazada atomar oshiriladi)
        Monument.objects.filter(pk=instance.pk).update(views=F('views') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        qs = self.get_queryset().filter(featured=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        qs = Monument.objects.filter(status='Chop etilgan')
        agg = qs.aggregate(
            total_views=Sum('views'),
            total_words=Sum('word_count'),
            total_lines=Sum('line_count'),
        )
        by_script   = list(qs.values('script').annotate(count=Count('id')).order_by('-count'))
        by_category = list(qs.values('category').annotate(count=Count('id')).order_by('-count'))
        by_century  = {}
        for m in qs.values_list('year', flat=True):
            if m is not None:
                c = f"{abs(m) // 100 + 1}-asr"
                by_century[c] = by_century.get(c, 0) + 1
        return Response({
            'total':      qs.count(),
            'totalViews': agg['total_views'] or 0,
            'totalWords': agg['total_words'] or 0,
            'totalLines': agg['total_lines'] or 0,
            'byScript':   by_script,
            'byCategory': by_category,
            'byCentury':  [{'century': k, 'count': v} for k, v in sorted(by_century.items())],
        })

    @action(detail=False, methods=['get'], url_path='concordance')
    def concordance(self, request):
        q = request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Response({'error': "Kamida 2 ta belgi kiriting"}, status=400)
        max_results = 200
        results = []
        q_lower = q.lower()
        qs = Monument.objects.filter(status='Chop etilgan')
        for m in qs:
            if len(results) >= max_results:
                break
            for field, text in [
                ('Matn', m.full_text or ''),
                ('Transliteratsiya', m.transliteration or ''),
                ('Tarjima', m.translation or ''),
            ]:
                text_lower = text.lower()
                idx = text_lower.find(q_lower)
                while idx != -1 and len(results) < max_results:
                    start = max(0, idx - 40)
                    end   = min(len(text), idx + len(q) + 40)
                    results.append({
                        'monumentId':    m.id,
                        'monumentTitle': m.title,
                        'field':  field,
                        'left':   text[start:idx],
                        'match':  text[idx:idx + len(q)],
                        'right':  text[idx + len(q):end],
                    })
                    idx = text_lower.find(q_lower, idx + 1)
        return Response({'query': q, 'count': len(results), 'results': results})

    @action(detail=False, methods=['get'], url_path='word-frequency')
    def word_frequency(self, request):
        """Korpus matnlarida (transliteratsiya) ko'p uchraydigan so'zlar chastotasi."""
        word_re = re.compile(r"[^\W\d_]+(?:['’ʼʻ][^\W\d_]+)*", re.UNICODE)
        counter = Counter()
        qs = Monument.objects.filter(status='Chop etilgan').exclude(transliteration='')
        for text in qs.values_list('transliteration', flat=True):
            for word in word_re.findall(text or ''):
                word = word.lower()
                if len(word) >= 3:
                    counter[word] += 1

        try:
            limit = int(request.query_params.get('limit', 100))
        except (TypeError, ValueError):
            return Response({'error': "limit butun son bo'lishi kerak"}, status=400)
        limit = max(1, min(limit, 300))
        top = counter.most_common(limit)
        return Response({
            'count': len(top),
            'results': [{'word': w, 'count': c, 'tr': WORD_TR.get(w)} for w, c in top],
        })


# ── MonumentSubmission API ────────────────────────────────────────────────────

class SubmissionCreateView(APIView):
    permission_classes = [permissions.AllowAny]
    # Spam va begona manzillarga xat yuborishni cheklash (settings: 'submit')
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'submit'

    def post(self, request):
        serializer = MonumentSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({'error': str(first_error)}, status=400)

        submission = serializer.save()

        # Email — admin ga
        if django_settings.ADMIN_EMAIL:
            review_url = request.build_absolute_uri(
                f'/django-admin/korpus/monumentsubmission/{submission.id}/change/'
            )
            send_mail(
                subject=f'[Turkiy Korpus] Yangi taklif: {submission.title}',
                message=(
                    f'Yangi yodgorlik taklifi keldi.\n\n'
                    f'Nomi: {submission.title}\n'
                    f'Muallif: {submission.author_name} <{submission.author_email}>\n'
                    f'Ko\'rib chiqish: {review_url}'
                ),
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[django_settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        # Email — foydalanuvchiga
        send_mail(
            subject='Taklifingiz qabul qilindi — Turkiy Korpus',
            message=(
                f'Assalomu alaykum, {submission.author_name}!\n\n'
                f'"{submission.title}" nomli taklifingiz qabul qilindi.\n'
                f'Admin ko\'rib chiqqandan so\'ng saytda ko\'rinadi.\n\n'
                f'Turkiy Yozma Yodgorliklar Elektron Korpusi'
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[submission.author_email],
            fail_silently=True,
        )

        return Response({
            'success': True,
            'id': submission.id,
            'message': "Yodgorlik muvaffaqiyatli yuborildi. Admin ko'rib chiqqandan so'ng saytda ko'rinadi.",
        }, status=201)


# ── SiteSettings API ──────────────────────────────────────────────────────────

class SiteSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        obj = SiteSettings.objects.first()
        if not obj:
            return Response({})
        return Response(SiteSettingsSerializer(obj).data)


# ── Export ────────────────────────────────────────────────────────────────────

class ExportView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import csv
        from django.http import HttpResponse, JsonResponse
        fmt = request.query_params.get('format', 'json')
        qs  = Monument.objects.filter(status='Chop etilgan').order_by('year')

        if fmt == 'csv':
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = 'attachment; filename="yodgorliklar.csv"'
            response.write('﻿')
            w = csv.writer(response)
            w.writerow(['ID', 'Nomi', 'Yil', 'Joy', 'Yozuv', 'Kategoriya', 'Til', "So'zlar", 'Ko\'rishlar'])
            for m in qs:
                w.writerow([m.id, m.title, m.year, m.location, m.script, m.category, m.language, m.word_count, m.views])
            return response

        data = MonumentDetailSerializer(qs, many=True).data
        return JsonResponse({'monuments': data, 'total': len(data)}, safe=False, json_dumps_params={'ensure_ascii': False})
