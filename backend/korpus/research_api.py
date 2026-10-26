import csv
import io
import json
import re
import xml.etree.ElementTree as ET

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .csv_utils import safe_cell
from .models import Monument, ReadingVariant, ResearchItem, WordForm
from .reading import reading_data
from .research import (canonical, collocation_data, filtered_monuments, frequency_data,
                       integer, result_target, search_corpus)
from .throttling import ExportRateThrottle, SearchRateThrottle


def download_rows(rows, columns, fmt, name):
    if fmt == 'csv':
        stream = io.StringIO(newline='')
        writer = csv.writer(stream)
        writer.writerow([label for _, label in columns])
        writer.writerows([[safe_cell(row.get(key, '')) for key, _ in columns] for row in rows])
        response = HttpResponse('\ufeff' + stream.getvalue(), content_type='text/csv; charset=utf-8')
    elif fmt == 'xlsx':
        from openpyxl import Workbook
        workbook = Workbook(write_only=True)
        sheet = workbook.create_sheet('Korpus')
        sheet.append([label for _, label in columns])
        for row in rows:
            sheet.append([safe_cell(row.get(key, '')) for key, _ in columns])
        stream = io.BytesIO()
        workbook.save(stream)
        response = HttpResponse(stream.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    elif fmt == 'json':
        response = HttpResponse(json.dumps(rows, ensure_ascii=False), content_type='application/json; charset=utf-8')
    else:
        raise ValidationError({'download': 'CSV, XLSX yoki JSON formatini tanlang.'})
    response['Content-Disposition'] = f'attachment; filename="{name}.{fmt}"'
    if len(response.content) > 4000000:
        raise ValidationError('Eksport 4 MB dan katta. Korpusni yoki qidiruvni filtrlar bilan toraytiring.')
    return response


def add_citations(request, rows):
    base = settings.FRONTEND_URL.rstrip('/')
    # The production SPA lives under /app; local Vite uses its own basename.
    if not base.startswith('/'):
        base = '/app'
    for row in rows:
        row['url'] = request.build_absolute_uri(base + row['target'])
        row['citation'] = f"{row['monumentTitle']} ({row['year']}), {row['label']}. {row['source']}. {row['url']}"


class ResearchSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SearchRateThrottle]

    def get(self, request):
        result = search_corpus(request.query_params)
        all_rows = result.pop('_all')
        add_citations(request, all_rows)
        fmt = request.query_params.get('download')
        if fmt:
            response = download_rows(all_rows, [('monumentTitle', 'Yodgorlik'), ('year', 'Yil'),
                ('label', 'Satr'), ('field', 'Matn turi'), ('left', 'Chap kontekst'), ('match', 'So‘z'),
                ('right', 'O‘ng kontekst'), ('source', 'Nashr va sahifa'), ('url', 'Havola'), ('citation', 'Iqtibos')], fmt, 'konkordans')
            response['X-Results-Truncated'] = str(result['truncated']).lower()
            return response
        return Response(result)


class ResearchFrequencyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SearchRateThrottle]

    def get(self, request):
        data = frequency_data(request.query_params)
        fmt = request.query_params.get('download')
        if fmt:
            response = download_rows(data['results'], [('word', 'So‘z'), ('count', 'Takrorlanish'),
                ('documents', 'Yodgorliklar'), ('per_10000', 'Har 10 000 so‘zga')], fmt, 'chastota')
            response['X-Results-Truncated'] = str(data['truncated']).lower()
            return response
        return Response(data)


class ResearchCollocationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SearchRateThrottle]

    def get(self, request):
        return Response(collocation_data(request.query_params))


class ResearchOptionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Monument.objects.filter(status='Chop etilgan')
        return Response({'scripts': [{'value': key, 'label': label} for key, label in Monument.SCRIPT_CHOICES],
                         'categories': [{'value': key, 'label': label} for key, label in Monument.CATEGORY_CHOICES],
                         'languages': list(qs.order_by('language').values_list('language', flat=True).distinct()),
                         'locations': list(qs.order_by('location').values_list('location', flat=True).distinct()),
                         'monuments': list(qs.order_by('year').values('id', 'title', 'year')[:1000]),
                         'monuments_truncated': qs.count() > 1000})


class MorphologyView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [SearchRateThrottle]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not 1 <= len(query) <= 150:
            raise ValidationError({'q': '1–150 belgili so‘z kiriting.'})
        key = canonical(query)
        rows = []
        for form in WordForm.objects.filter(published=True, reviewed=True, reviewed_by__isnull=False).select_related('word'):
            if canonical(form.form) == key or canonical(form.lemma) == key:
                rows.append({'id': form.pk, 'form': form.form, 'lemma': form.lemma,
                    'part_of_speech': form.part_of_speech, 'root': form.root,
                    'segmentation': form.segmentation, 'features': form.features, 'source': form.source,
                    'word_id': form.word_id if form.word and form.word.published else None,
                    'reviewed_at': form.reviewed_at})
                if len(rows) == 100:
                    break
        return Response({'query': query, 'results': rows, 'reviewed_only': True})


class ReadingVariantsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        monument = get_object_or_404(Monument, pk=integer(request.query_params, 'monument', 0, 1, 2147483647), status='Chop etilgan')
        rows = ReadingVariant.objects.filter(line__monument=monument, line__published=True,
            published=True, reviewed_by__isnull=False).select_related('line')
        return Response({'results': [{'id': row.pk, 'position': row.line.position, 'label': row.line.label,
            'scholar': row.scholar, 'reading': row.reading, 'translation': row.translation,
            'source': row.source, 'note': row.note, 'certainty': row.certainty} for row in rows]})


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchItem
        fields = ['id', 'key', 'kind', 'title', 'target', 'collection', 'note', 'payload', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {'key': {'validators': []}, 'note': {'max_length': 10000}}

    def validate_key(self, value):
        if self.instance and value != self.instance.key:
            raise serializers.ValidationError('Saqlangan yozuv kalitini o‘zgartirib bo‘lmaydi.')
        if not re.fullmatch(r'[A-Za-z0-9:_-]{1,180}', value):
            raise serializers.ValidationError('Yozuv kaliti noto‘g‘ri.')
        return value

    def validate_target(self, value):
        if value and (not value.startswith('/') or value.startswith('//') or '\\' in value
                      or any(ord(char) < 32 for char in value)):
            raise serializers.ValidationError('Faqat sayt ichidagi havolani kiriting.')
        return value

    def validate_payload(self, value):
        if not isinstance(value, dict) or len(json.dumps(value, ensure_ascii=False)) > 20000:
            raise serializers.ValidationError('Yozuv ma’lumoti obyekt va 20 000 belgidan kichik bo‘lsin.')
        return value


class WorkspaceViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkspaceSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'private, no-store'
        return response

    def get_queryset(self):
        qs = ResearchItem.objects.filter(user=self.request.user)
        for key in ('kind', 'collection'):
            if self.request.query_params.get(key):
                qs = qs.filter(**{key: self.request.query_params[key]})
        query = self.request.query_params.get('q', '').strip()
        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(note__icontains=query))
        return qs

    def perform_create(self, serializer):
        with transaction.atomic():
            get_user_model().objects.select_for_update().get(pk=self.request.user.pk)
            if ResearchItem.objects.filter(user=self.request.user).count() >= 5000:
                raise ValidationError('Daftarda 5000 ta yozuv bor. Keraksizlarini o‘chiring.')
            if ResearchItem.objects.filter(user=self.request.user, key=serializer.validated_data['key']).exists():
                raise ValidationError({'key': 'Bu kalitli yozuv allaqachon bor.'})
            serializer.save(user=self.request.user)

    @action(detail=False, methods=['put', 'delete'], url_path='by-key')
    def by_key(self, request):
        key = request.data.get('key', '')
        if not isinstance(key, str) or not re.fullmatch(r'[A-Za-z0-9:_-]{1,180}', key):
            raise ValidationError({'key': 'Yozuv kaliti noto‘g‘ri.'})
        if request.method == 'DELETE':
            ResearchItem.objects.filter(user=request.user, key=key).delete()
            return Response(status=204)
        # Lock the owner, including the first insert, to serialize tab races.
        with transaction.atomic():
            get_user_model().objects.select_for_update().get(pk=request.user.pk)
            row = ResearchItem.objects.filter(user=request.user, key=key).first()
            serializer = self.get_serializer(row, data=request.data)
            serializer.is_valid(raise_exception=True)
            if row is None:
                self.perform_create(serializer)
            else:
                serializer.save()
            return Response(serializer.data, status=200 if row else 201)


class WorkspaceExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ExportRateThrottle]

    def get(self, request):
        queryset = ResearchItem.objects.filter(user=request.user)
        for key in ('kind', 'collection'):
            if request.query_params.get(key):
                queryset = queryset.filter(**{key: request.query_params[key]})
        query = request.query_params.get('q', '').strip()
        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(note__icontains=query))
        rows = WorkspaceSerializer(queryset, many=True).data
        response = download_rows(rows, [('title', 'Sarlavha'), ('kind', 'Turi'), ('collection', 'To‘plam'),
            ('note', 'Shaxsiy izoh'), ('target', 'Havola'), ('updated_at', 'Yangilangan')], request.query_params.get('download', 'json'), 'tadqiqot-daftari')
        response['Cache-Control'] = 'private, no-store'
        return response


def tei_export(monuments):
    ns = 'http://www.tei-c.org/ns/1.0'
    ET.register_namespace('', ns)
    def node(parent, tag, text=None, **attrs):
        element = ET.SubElement(parent, f'{{{ns}}}{tag}', attrs)
        element.text = text
        return element
    root = ET.Element(f'{{{ns}}}teiCorpus')
    header = node(root, 'teiHeader')
    desc = node(header, 'fileDesc')
    node(node(desc, 'titleStmt'), 'title', 'Turkiy Meros — tanlangan korpus')
    node(node(desc, 'publicationStmt'), 'p', 'Turkiy Meros. Har bir materialning manbasi alohida ko‘rsatilgan.')
    node(node(desc, 'sourceDesc'), 'p', 'Saytdagi nashr qilingan matnlar va ekspert tekshirgan satrlar.')
    for monument in monuments:
        tei = node(root, 'TEI', **{'{http://www.w3.org/XML/1998/namespace}id': f'm{monument.pk}'})
        desc = node(node(tei, 'teiHeader'), 'fileDesc')
        node(node(desc, 'titleStmt'), 'title', monument.title)
        node(node(desc, 'publicationStmt'), 'p', f'Turkiy Meros; yangilangan: {monument.updated_at.isoformat()}')
        source_desc = node(desc, 'sourceDesc')
        sources = node(source_desc, 'listBibl')
        from .research import bibliography_text
        node(sources, 'bibl', bibliography_text(monument) or 'Manba ma’lumoti kiritilmagan.')
        body = node(node(tei, 'text'), 'body')
        reading = reading_data(monument)
        for field, title in [('original', 'Asl matn'), ('transliteration', 'Transliteratsiya'), ('translation', 'Tarjima')]:
            division = node(body, 'div', type=field)
            node(division, 'head', title)
            if reading['lines']:
                for line in reading['lines']:
                    segment = node(division, 'ab', n=str(line['label'] or line['position']))
                    content = line.get(field, '')
                    certainty = line.get('certainty', 'certain')
                    if certainty in ('uncertain', 'restored'):
                        node(segment, 'unclear' if certainty == 'uncertain' else 'supplied', content, **({'cert': 'low'} if certainty == 'uncertain' else {'reason': 'lost'}))
                    else:
                        segment.text = content
                    if line.get('source'):
                        node(segment, 'note', line['source'], type='source')
            else:
                node(division, 'p', getattr(monument, 'full_text' if field == 'original' else field))
        variants = ReadingVariant.objects.filter(line__monument=monument, line__published=True,
            published=True, reviewed_by__isnull=False).select_related('line')
        if variants:
            back = node(tei.find(f'{{{ns}}}text'), 'back')
            apparatus = node(node(back, 'div', type='apparatus'), 'listApp')
            grouped = {}
            for variant in variants:
                source_id = f'v{variant.pk}'
                node(sources, 'bibl', f'{variant.scholar}. {variant.source}', **{'{http://www.w3.org/XML/1998/namespace}id': source_id})
                app = grouped.get(variant.line_id)
                if app is None:
                    app = node(apparatus, 'app', loc=variant.line.label or str(variant.line.position))
                    node(app, 'lem', variant.line.transliteration)
                    grouped[variant.line_id] = app
                node(app, 'rdg', variant.reading, source=f'#{source_id}', cert='low' if variant.certainty == 'uncertain' else 'high')
    response = HttpResponse(ET.tostring(root, encoding='utf-8', xml_declaration=True), content_type='application/tei+xml; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="turkiy-meros.tei.xml"'
    if len(response.content) > 4000000:
        raise ValidationError('TEI fayli 4 MB dan katta. Kamroq yodgorlik tanlang.')
    return response


class ResearchCorpusExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ExportRateThrottle]

    def get(self, request):
        qs = filtered_monuments(request.query_params)
        if request.query_params.get('q', '').strip():
            matches = search_corpus(request.query_params)
            if matches['truncated']:
                raise ValidationError('Eksportdan oldin qidiruv filtrlarini toraytiring.')
            qs = qs.filter(pk__in={row['monumentId'] for row in matches['_all']})
        if qs.count() > 1000:
            raise ValidationError('Eksport uchun ko‘pi bilan 1000 ta yodgorlik tanlang.')
        fmt = request.query_params.get('download', 'tei')
        if fmt == 'tei':
            return tei_export(qs)
        rows = []
        for monument in qs:
            for line in reading_data(monument)['lines']:
                rows.append({'monumentTitle': monument.title, 'year': monument.year,
                    'label': line['label'] or str(line['position']), 'original': line['original'],
                    'transliteration': line['transliteration'], 'translation': line['translation'],
                    'source': line['source'], 'target': result_target(monument.pk, line['position'])})
            if not reading_data(monument)['lines']:
                rows.append({'monumentTitle': monument.title, 'year': monument.year, 'label': '',
                    'original': monument.full_text, 'transliteration': monument.transliteration,
                    'translation': monument.translation, 'source': '', 'target': result_target(monument.pk)})
        add_citations(request, rows)
        return download_rows(rows, [('monumentTitle', 'Yodgorlik'), ('year', 'Yil'), ('label', 'Satr'),
            ('original', 'Asl matn'), ('transliteration', 'Transliteratsiya'), ('translation', 'Tarjima'),
            ('source', 'Manba'), ('url', 'Havola')], fmt, 'tanlangan-korpus')
