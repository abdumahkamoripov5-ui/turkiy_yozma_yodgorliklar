"""Durable MVP content. Imported by korpus.models for Django model discovery."""
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.core.validators import FileExtensionValidator
from django.db import models, transaction
from django.db.models import Count
from django.utils import timezone

from .models import _random_name


def public_upload(instance, filename):
    return _random_name('library', filename)


def private_upload(instance, filename):
    return _random_name('research', filename)


def research_storage():
    # Pending research files must never be exposed by the public /media/ route.
    if settings.PRIVATE_AWS_STORAGE_BUCKET_NAME:
        from storages.backends.s3 import S3Storage
        return S3Storage(
            bucket_name=settings.PRIVATE_AWS_STORAGE_BUCKET_NAME,
            endpoint_url=getattr(settings, 'AWS_S3_ENDPOINT_URL', None),
            region_name=getattr(settings, 'AWS_S3_REGION_NAME', None),
            custom_domain=None, default_acl=None, querystring_auth=True,
            file_overwrite=False,
        )
    return FileSystemStorage(location=settings.PRIVATE_UPLOADS_ROOT)


def validate_pages(value):
    if not isinstance(value, list) or any(
        not isinstance(page, dict)
        or not isinstance(page.get('title'), str)
        or not isinstance(page.get('text'), str) for page in value
    ):
        raise ValidationError('Sahifalar [{"title": "...", "text": "..."}] shaklida bo‘lsin.')


def validate_quiz(value):
    if not value:
        return
    if (not isinstance(value, dict) or not isinstance(value.get('question'), str)
            or not isinstance(value.get('options'), list)
            or not 2 <= len(value['options']) <= 6
            or any(not isinstance(option, str) for option in value['options'])
            or type(value.get('answer')) is not int
            or not 0 <= value['answer'] < len(value['options'])
            or not isinstance(value.get('explanation', ''), str)):
        raise ValidationError('Test: question, options (2–6 matn), answer (0 dan), explanation.')


class Book(models.Model):
    title = models.CharField('Nomi', max_length=250)
    author = models.CharField('Muallif', max_length=250)
    description = models.TextField('Tavsif')
    language = models.CharField('Til', max_length=80, default='O‘zbekcha')
    period = models.CharField('Davr', max_length=100, blank=True)
    cover_style = models.CharField('Muqova rangi', max_length=20,
                                  choices=[('forest', 'Yashil'), ('clay', 'G‘isht'), ('ink', 'Siyoh')], default='forest')
    pages = models.JSONField('Sahifalar', default=list, validators=[validate_pages])
    source = models.CharField('Manba / foydalanish sharti', max_length=500, blank=True)
    is_sample = models.BooleanField('Namuna material', default=False)
    published = models.BooleanField('Nashr qilingan', default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Elektron kitob'
        verbose_name_plural = 'Elektron kitoblar'

    def __str__(self):
        return self.title


class WordEntry(models.Model):
    word = models.CharField('So‘z', max_length=100)
    pronunciation = models.CharField('Talaffuz', max_length=200, blank=True)
    equivalents = models.JSONField('Turkiy muqobillar (til: so‘z)', default=dict, blank=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                    on_delete=models.SET_NULL, related_name='reviewed_words')
    reviewed_at = models.DateTimeField('Ekspert tekshirgan vaqt', null=True, blank=True)
    meaning = models.TextField('Ma’nosi')
    example = models.TextField('Misol', blank=True)
    source = models.CharField('Manba', max_length=500)
    status = models.CharField('Maqom', max_length=20, choices=[
        ('historical', 'Tarixiy so‘z'), ('community', 'Jamoatchilik tanlagan')], default='historical')
    monument = models.ForeignKey('korpus.Monument', null=True, blank=True, on_delete=models.SET_NULL)
    campaign = models.OneToOneField('korpus.WordPoll', null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name='published_word')
    published = models.BooleanField('Nashr qilingan', default=False)

    class Meta:
        ordering = ['word']
        verbose_name = 'Lug‘at so‘zi'
        verbose_name_plural = 'Lug‘at so‘zlari'

    def __str__(self):
        return self.word

    def clean(self):
        super().clean()
        if not isinstance(self.equivalents, dict) or any(
                not isinstance(k, str) or not isinstance(v, str)
                for k, v in self.equivalents.items()):
            raise ValidationError({'equivalents': 'Til va so‘z juftliklarini kiriting: {"uz": "...", "tr": "..."}.'})


class MediaLesson(models.Model):
    title = models.CharField('Nomi', max_length=250)
    description = models.TextField('Tavsif')
    audience = models.CharField('Yosh guruhi', max_length=20,
                                choices=[('children', '7–12 yosh'), ('teens', '12–18 yosh')])
    series = models.CharField('Serial', max_length=150, blank=True)
    episode = models.PositiveIntegerField('Qism', default=1)
    video = models.FileField('Video (MP4/WebM)', upload_to=public_upload, blank=True,
                            validators=[FileExtensionValidator(['mp4', 'webm'])])
    transcript = models.TextField('Dars matni / video transkripti', blank=True)
    words = models.ManyToManyField(WordEntry, blank=True, verbose_name='Bog‘liq so‘zlar')
    quiz = models.JSONField('Topshiriq', default=dict, blank=True, validators=[validate_quiz])
    published = models.BooleanField('Nashr qilingan', default=False)
    is_sample = models.BooleanField('Namuna material', default=False)

    class Meta:
        ordering = ['series', 'episode', 'id']
        verbose_name = 'Video dars'
        verbose_name_plural = 'Video darslar'

    def __str__(self):
        return self.title

    def clean(self):
        if (self.video and not self.video._committed and not settings.DEBUG
                and not settings.AWS_STORAGE_BUCKET_NAME and not settings.MEDIA_UPLOADS_PERSISTENT):
            raise ValidationError({'video': 'Video yuklashdan oldin doimiy media xotirasini sozlang.'})


class WordPoll(models.Model):
    title = models.CharField('Nomi', max_length=250)
    context = models.TextField('Savol va tushuntirish')
    starts_at = models.DateTimeField('Boshlanish', default=timezone.now)
    ends_at = models.DateTimeField('Tugash')
    published = models.BooleanField('Ochiq', default=False)
    is_sample = models.BooleanField('Namuna kampaniya', default=False)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                    on_delete=models.SET_NULL, related_name='+', editable=False)
    approved_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        ordering = ['-starts_at']
        verbose_name = 'So‘z kampaniyasi'
        verbose_name_plural = 'So‘z kampaniyalari'

    def __str__(self):
        return self.title

    def clean(self):
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValidationError('Tugash vaqti boshlanishdan keyin bo‘lsin.')

    @property
    def is_open(self):
        return self.published and self.starts_at <= timezone.now() < self.ends_at

    def approve_winner(self, user):
        with transaction.atomic():
            poll = WordPoll.objects.select_for_update().get(pk=self.pk)
            if poll.ends_at > timezone.now():
                raise ValidationError('Avval kampaniya muddati tugashi kerak.')
            if WordEntry.objects.filter(campaign=poll).exists():
                raise ValidationError('Natija allaqachon lug‘atga qo‘shilgan.')
            ranked = list(poll.options.annotate(total=Count('votes')).order_by('-total', 'id'))
            if not ranked or ranked[0].total == 0:
                raise ValidationError('Hali ovoz yo‘q.')
            if len(ranked) > 1 and ranked[0].total == ranked[1].total:
                raise ValidationError('Ovozlar teng. Ikkinchi tur kerak.')
            winner = ranked[0]
            word = WordEntry.objects.create(
                word=winner.word, meaning=winner.explanation, source=f'Jamoatchilik tanlovi: {poll.title}',
                status='community', campaign=poll, published=True,
                reviewed_by=user, reviewed_at=timezone.now())
            poll.approved_by, poll.approved_at = user, timezone.now()
            poll.save(update_fields=['approved_by', 'approved_at'])
            return word


class PollOption(models.Model):
    poll = models.ForeignKey(WordPoll, on_delete=models.CASCADE, related_name='options')
    word = models.CharField('Variant', max_length=100)
    explanation = models.TextField('Izoh')
    source = models.CharField('Dalil / manba', max_length=500, blank=True)

    class Meta:
        ordering = ['id']
        verbose_name = 'Ovoz varianti'
        verbose_name_plural = 'Ovoz variantlari'

    def __str__(self):
        return self.word


class PollVote(models.Model):
    poll = models.ForeignKey(WordPoll, on_delete=models.CASCADE, related_name='votes')
    option = models.ForeignKey(PollOption, on_delete=models.PROTECT, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['poll', 'user'], name='one_vote_per_user_poll')]
        verbose_name = 'Ovoz'
        verbose_name_plural = 'Ovozlar'

    def clean(self):
        if self.option_id and self.poll_id and self.option.poll_id != self.poll_id:
            raise ValidationError('Variant ushbu kampaniyaga tegishli emas.')


class ResearchWork(models.Model):
    title = models.CharField('Nomi', max_length=250)
    kind = models.CharField('Turi', max_length=20, choices=[
        ('article', 'Maqola'), ('book', 'Kitob'), ('thesis', 'Dissertatsiya'),
        ('text', 'Yodgorlik matni'), ('lesson', 'Video dars')])
    author = models.CharField('Muallif', max_length=150)
    institution = models.CharField('Institut', max_length=250, blank=True)
    abstract = models.TextField('Annotatsiya')
    source_url = models.URLField('Manba havolasi', blank=True)
    document = models.FileField('PDF fayl', upload_to=private_upload, storage=research_storage,
                                blank=True, validators=[FileExtensionValidator(['pdf'])])
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField('Holat', max_length=20, choices=[
        ('pending', 'Kutilmoqda'), ('approved', 'Nashr qilingan'), ('rejected', 'Rad etilgan')], default='pending')
    reviewer_note = models.TextField('Muallifga izoh', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Ilmiy ish'
        verbose_name_plural = 'Ilmiy ishlar'

    def __str__(self):
        return self.title


class SourceLink(models.Model):
    title = models.CharField('Manba', max_length=150)
    url = models.URLField('Havola')
    description = models.TextField('Tavsif')
    published = models.BooleanField('Ko‘rsatish', default=False)

    class Meta:
        verbose_name = 'Tashqi manba'
        verbose_name_plural = 'Tashqi manbalar'

    def __str__(self):
        return self.title
