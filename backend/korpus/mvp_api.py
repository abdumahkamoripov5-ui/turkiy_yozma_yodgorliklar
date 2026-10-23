import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction, connection
from django.db.models import Count
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import serializers, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Book, WordEntry, MediaLesson, WordPoll, PollOption, PollVote, ResearchWork, SourceLink
from .throttling import ScopedRateThrottle


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordEntry
        fields = ['id', 'word', 'meaning', 'example', 'source', 'status', 'monument', 'campaign']


class BookSerializer(serializers.ModelSerializer):
    page_count = serializers.SerializerMethodField()

    def get_page_count(self, obj):
        return len(obj.pages)

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'description', 'language', 'period', 'cover_style',
                  'pages', 'page_count', 'source', 'is_sample']


class LessonSerializer(serializers.ModelSerializer):
    words = serializers.SerializerMethodField()
    quiz = serializers.SerializerMethodField()

    def get_words(self, obj):
        return WordSerializer(obj.words.filter(published=True), many=True).data

    def get_quiz(self, obj):
        return {key: value for key, value in obj.quiz.items() if key in ['question', 'options']}

    class Meta:
        model = MediaLesson
        fields = ['id', 'title', 'description', 'audience', 'series', 'episode',
                  'video', 'transcript', 'words', 'quiz', 'is_sample']


class PollSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    total_votes = serializers.IntegerField(source='votes.count', read_only=True)
    my_vote = serializers.SerializerMethodField()
    is_open = serializers.BooleanField(read_only=True)
    published_word = serializers.SerializerMethodField()

    def get_options(self, obj):
        return list(obj.options.annotate(votes_count=Count('votes')).values(
            'id', 'word', 'explanation', 'source', 'votes_count'))

    def get_my_vote(self, obj):
        user = self.context['request'].user
        return obj.votes.filter(user=user).values_list('option_id', flat=True).first() if user.is_authenticated else None

    def get_published_word(self, obj):
        entry = WordEntry.objects.filter(campaign=obj, published=True).first()
        return WordSerializer(entry).data if entry else None

    class Meta:
        model = WordPoll
        fields = ['id', 'title', 'context', 'starts_at', 'ends_at', 'is_open', 'is_sample',
                  'options', 'total_votes', 'my_vote', 'published_word']


class PublicReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    search_fields = ['title', 'description']


class BookViewSet(PublicReadOnlyViewSet):
    queryset = Book.objects.filter(published=True)
    serializer_class = BookSerializer
    search_fields = ['title', 'author', 'description']

    def get_serializer(self, *args, **kwargs):
        serializer = super().get_serializer(*args, **kwargs)
        # Page content is only fetched when a reader opens a book.
        if self.action == 'list':
            serializer.child.fields.pop('pages', None)
        return serializer


class WordViewSet(PublicReadOnlyViewSet):
    queryset = WordEntry.objects.filter(published=True)
    serializer_class = WordSerializer
    search_fields = ['word', 'meaning', 'example']
    throttle_scope = 'search'

    @action(detail=False, methods=['get'], throttle_classes=[ScopedRateThrottle])
    def lookup(self, request):
        from .reading import normalize_word
        query = request.query_params.get('q', '').strip()
        if not query or len(query) > 100:
            raise ValidationError({'q': '1–100 belgili so‘z kiriting.'})
        key = normalize_word(query)
        matches = []
        for entry in self.get_queryset().iterator():
            if normalize_word(entry.word) == key:
                matches.append(entry)
                if len(matches) == 20:
                    break
        return Response({'query': query, 'results': self.get_serializer(matches, many=True).data})


class LessonViewSet(PublicReadOnlyViewSet):
    queryset = MediaLesson.objects.filter(published=True).prefetch_related('words')
    serializer_class = LessonSerializer
    filterset_fields = ['audience']

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def answer(self, request, pk=None):
        lesson = self.get_object()
        value = request.data.get('answer')
        if not lesson.quiz or type(value) is not int or not 0 <= value < len(lesson.quiz['options']):
            raise ValidationError({'answer': 'Javob variantini tanlang.'})
        return Response({'correct': value == lesson.quiz['answer'],
                         'answer': lesson.quiz['answer'], 'explanation': lesson.quiz.get('explanation', '')})


class PollViewSet(PublicReadOnlyViewSet):
    queryset = WordPoll.objects.filter(published=True)
    serializer_class = PollSerializer
    search_fields = ['title', 'context']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        option_id = request.data.get('option')
        if type(option_id) is not int:
            raise ValidationError({'option': 'Variantni tanlang.'})
        with transaction.atomic():
            poll = get_object_or_404(self.get_queryset().select_for_update(), pk=pk)
            if not poll.is_open:
                raise ValidationError({'detail': 'Kampaniya hozir ovoz qabul qilmayapti.'})
            option = get_object_or_404(PollOption, pk=option_id, poll=poll)
            try:
                with transaction.atomic():
                    PollVote.objects.create(poll=poll, option=option, user=request.user)
            except IntegrityError:
                return Response({'detail': 'Siz ushbu kampaniyada ovoz bergansiz.'}, status=409)
        return Response(self.get_serializer(poll).data, status=status.HTTP_201_CREATED)


class ResearchSerializer(serializers.ModelSerializer):
    document_url = serializers.SerializerMethodField()
    document = serializers.FileField(write_only=True, required=False)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        user = self.context['request'].user
        if not user.is_authenticated or not (user.is_staff or user.id == instance.submitted_by_id):
            data.pop('reviewer_note', None)
        return data

    def get_document_url(self, obj):
        if obj.document:
            return self.context['request'].build_absolute_uri(f'/api/v2/research/{obj.pk}/document/')
        return None

    def validate_document(self, value):
        if (not settings.DEBUG and not settings.PRIVATE_AWS_STORAGE_BUCKET_NAME
                and not settings.PRIVATE_UPLOADS_PERSISTENT):
            raise serializers.ValidationError('PDF uchun yopiq doimiy xotira sozlanmagan. Hozircha manba havolasini yuboring.')
        if value.size > 20 * 1024 * 1024:
            raise serializers.ValidationError('PDF 20 MB dan katta bo‘lmasin.')
        prefix = value.read(5)
        value.seek(0)
        if prefix != b'%PDF-':
            raise serializers.ValidationError('Haqiqiy PDF fayl yuklang.')
        return value

    class Meta:
        model = ResearchWork
        fields = ['id', 'title', 'kind', 'author', 'institution', 'abstract', 'source_url',
                  'document', 'document_url', 'status', 'reviewer_note', 'created_at']
        read_only_fields = ['status', 'reviewer_note', 'created_at']


class ResearchViewSet(viewsets.GenericViewSet):
    serializer_class = ResearchSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = ResearchWork.objects.all()
        if self.action == 'mine':
            return qs.filter(submitted_by=self.request.user)
        if self.action == 'document':
            return qs
        return qs.filter(status='approved')

    def list(self, request):
        qs = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(qs)
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    def get_permissions(self):
        if self.action in ['create', 'mine']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(submitted_by=request.user, status='pending')
        return Response(serializer.data, status=201)

    @action(detail=False)
    def mine(self, request):
        page = self.paginate_queryset(self.get_queryset())
        return self.get_paginated_response(self.get_serializer(page, many=True).data)

    @action(detail=True)
    def document(self, request, pk=None):
        obj = self.get_object()
        allowed = obj.status == 'approved' or (
            request.user.is_authenticated and (request.user.is_staff or obj.submitted_by_id == request.user.id))
        if not allowed or not obj.document:
            from django.http import Http404
            raise Http404
        response = FileResponse(obj.document.open('rb'), content_type='application/pdf', as_attachment=True,
                                filename=f'ilmiy-ish-{obj.pk}.pdf')
        response['Cache-Control'] = 'private, no-store'
        return response


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceLink
        fields = ['id', 'title', 'url', 'description']


class SourceViewSet(PublicReadOnlyViewSet):
    queryset = SourceLink.objects.filter(published=True)
    serializer_class = SourceSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = get_user_model()
        fields = ['username', 'password']

    def validate(self, data):
        user = get_user_model()(username=data['username'])
        try:
            validate_password(data['password'], user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return data


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'submit'

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = get_user_model().objects.create_user(**serializer.validated_data)
        except IntegrityError:
            raise ValidationError({'username': 'Bu foydalanuvchi nomi band.'})
        token = RefreshToken.for_user(user)
        return Response({'username': user.username, 'is_staff': False,
                         'access': str(token.access_token), 'refresh': str(token)}, status=201)


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
        except Exception:
            return Response({'status': 'unavailable'}, status=503)
        return Response({'status': 'ok', 'mvp': True, 'release': (
            os.environ.get('VERCEL_GIT_COMMIT_SHA') or os.environ.get('RENDER_GIT_COMMIT', 'local'))})
