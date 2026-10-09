import os
import uuid

from django.db import models


def _random_name(folder, filename):
    # Tasodifiy nom — ochiq xotirada (S3/R2) fayl manzilini taxmin qilib bo'lmasin
    ext = os.path.splitext(filename)[1].lower()[:10]
    return f'{folder}/{uuid.uuid4().hex}{ext}'


def century_of(year):
    """Yil qaysi asrga tegishli: 1–100 → 1-asr, 701–800 → 8-asr, 700 → 7-asr.

    Miloddan avvalgi yillar (manfiy) uchun ham asr raqami musbat qaytadi.
    """
    if year is None:
        return None
    return max(1, (abs(year) - 1) // 100 + 1)


def submission_image_path(instance, filename):
    return _random_name('submissions/images', filename)


def submission_document_path(instance, filename):
    return _random_name('submissions/docs', filename)


class Monument(models.Model):
    SCRIPT_CHOICES = [
        ('koktürk', "Ko'ktürk"),
        ('sogd', "So'g'd"),
        ('uyg\'ur', "Uyg'ur"),
        ('arab', "Arab"),
        ('boshqa', "Boshqa"),
    ]

    CATEGORY_CHOICES = [
        ('bitiglar', "Bitik toshlar"),
        ('qollanmalar', "Qo'llanmalar"),
        ('diniy', "Diniy matnlar"),
        ('adabiy', "Adabiy asarlar"),
        ('boshqa', "Boshqa"),
    ]

    title = models.CharField(max_length=255, verbose_name="Nomi")
    title_original = models.CharField(max_length=255, blank=True, verbose_name="Asl nomi")
    year = models.IntegerField(verbose_name="Yil")
    year_end = models.IntegerField(null=True, blank=True, verbose_name="Tugash yili")
    location = models.CharField(max_length=255, verbose_name="Joy")
    script = models.CharField(max_length=50, choices=SCRIPT_CHOICES, verbose_name="Yozuv turi")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, verbose_name="Kategoriya")
    language = models.CharField(max_length=100, default="Ko'hna turkiy", verbose_name="Til")
    description = models.TextField(verbose_name="Tavsif")
    significance = models.TextField(blank=True, verbose_name="Ahamiyati")
    full_text = models.TextField(blank=True, verbose_name="To'liq matn (asl yozuv)")
    transliteration = models.TextField(blank=True, verbose_name="Transliteratsiya")
    translation = models.TextField(blank=True, verbose_name="Tarjima")
    image = models.URLField(blank=True, verbose_name="Rasm URL")
    researchers = models.JSONField(default=list, verbose_name="Tadqiqotchilar")
    bibliography = models.JSONField(default=list, verbose_name="Bibliografiya")
    tags = models.JSONField(default=list, verbose_name="Teglar")
    word_count = models.IntegerField(default=0, verbose_name="So'zlar soni")
    line_count = models.IntegerField(default=0, verbose_name="Qatorlar soni")
    status = models.CharField(max_length=100, default="Chop etilgan", verbose_name="Holat")
    importance = models.IntegerField(default=3, verbose_name="Ahamiyat (1-5)")
    views = models.IntegerField(default=0, verbose_name="Ko'rishlar soni")
    featured = models.BooleanField(default=False, verbose_name="Tanlangan")
    author_name = models.CharField(max_length=200, blank=True, verbose_name="Muallif ismi")
    author_email = models.EmailField(blank=True, verbose_name="Muallif email")
    author_institution = models.CharField(max_length=300, blank=True, verbose_name="Muallif tashkiloti")
    is_user_submission = models.BooleanField(default=False, verbose_name="Foydalanuvchi yuborgan")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Yodgorlik"
        verbose_name_plural = "Yodgorliklar"
        ordering = ['year']

    def __str__(self):
        return self.title

    @property
    def century(self):
        return century_of(self.year)

    @property
    def date_str(self):
        if self.year_end:
            return f"{self.year}–{self.year_end}"
        return str(self.year)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'titleOriginal': self.title_original,
            'subtitle': self.title_original or '',
            'year': self.year,
            'yearEnd': self.year_end,
            'date': self.date_str,
            'era': self.date_str,
            'century': self.century,
            'location': self.location,
            'script': self.script,
            'category': self.category,
            'language': self.language,
            'description': self.description,
            'significance': self.significance,
            'fullText': self.full_text,
            'transcription': self.full_text,
            'transliteration': self.transliteration,
            'translation': self.translation,
            'image': self.image,
            'researchers': self.researchers,
            'bibliography': self.bibliography,
            'tags': self.tags,
            'wordCount': self.word_count,
            'lineCount': self.line_count,
            'status': self.status,
            'importance': self.importance,
            'views': self.views,
            'featured': self.featured,
            'authorName': self.author_name,
            'authorInstitution': self.author_institution,
            'isUserSubmission': self.is_user_submission,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class MonumentSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Kutilmoqda'),
        ('approved', 'Tasdiqlangan'),
        ('rejected', 'Rad etilgan'),
    ]

    # Yodgorlik ma'lumotlari
    title        = models.CharField(max_length=255, verbose_name="Nomi")
    year         = models.IntegerField(verbose_name="Yil (taxminiy)")
    location     = models.CharField(max_length=255, verbose_name="Joy")
    script       = models.CharField(max_length=50, choices=Monument.SCRIPT_CHOICES, verbose_name="Yozuv turi")
    category     = models.CharField(max_length=50, choices=Monument.CATEGORY_CHOICES, verbose_name="Kategoriya")
    language     = models.CharField(max_length=100, default="Ko'hna turkiy", verbose_name="Til")
    description  = models.TextField(verbose_name="Tavsif")
    image        = models.URLField(blank=True, verbose_name="Rasm URL (ixtiyoriy)")
    image_file   = models.ImageField(upload_to=submission_image_path, blank=True, null=True,
                                     verbose_name="Rasm fayli (yuklash)")
    document     = models.FileField(upload_to=submission_document_path, blank=True, null=True,
                                    verbose_name="Hujjat (PDF/Word/boshqa)")
    full_text    = models.TextField(blank=True, verbose_name="To'liq matn (ixtiyoriy)")
    transliteration = models.TextField(blank=True, verbose_name="Transliteratsiya (ixtiyoriy)")
    translation  = models.TextField(blank=True, verbose_name="Tarjima (ixtiyoriy)")
    source_info  = models.TextField(blank=True, verbose_name="Manba / adabiyot")

    # Muallif ma'lumotlari
    author_name        = models.CharField(max_length=200, verbose_name="Ismingiz")
    author_email       = models.EmailField(verbose_name="Elektron pochta")
    author_institution = models.CharField(max_length=300, blank=True, verbose_name="Tashkilot / universitet")
    author_bio         = models.TextField(blank=True, verbose_name="O'zingiz haqingizda")

    # Holat
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Holat")
    reviewer_note = models.TextField(blank=True, verbose_name="Admin izohi")
    submitted_at  = models.DateTimeField(auto_now_add=True, verbose_name="Yuborilgan vaqt")
    reviewed_at   = models.DateTimeField(null=True, blank=True, verbose_name="Ko'rib chiqilgan vaqt")

    # Tasdiqlangandan keyin yaratilgan yodgorlik
    monument = models.OneToOneField(
        Monument, null=True, blank=True,
        on_delete=models.SET_NULL,
        verbose_name="Yaratilgan yodgorlik"
    )

    class Meta:
        verbose_name = "Taklif etilgan yodgorlik"
        verbose_name_plural = "Taklif etilgan yodgorliklar"
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} — {self.author_name} ({self.get_status_display()})"


class LoginActivity(models.Model):
    EVENT_CHOICES = [
        ('login',  'Kirdi'),
        ('logout', 'Chiqdi'),
        ('failed', 'Muvaffaqiyatsiz urinish'),
    ]
    VIA_CHOICES = [
        ('admin', 'Admin panel'),
        ('api',   'Sayt (API)'),
    ]

    user = models.ForeignKey(
        'auth.User', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='login_activities', verbose_name="Foydalanuvchi",
    )
    # Muvaffaqiyatsiz urinishlarda user bo'lmaydi — kiritilgan login shu yerda qoladi
    username = models.CharField("Kiritilgan login", max_length=150, blank=True)
    event = models.CharField("Hodisa", max_length=10, choices=EVENT_CHOICES)
    via = models.CharField("Qayerdan", max_length=10, choices=VIA_CHOICES, default='admin')
    ip = models.GenericIPAddressField("IP manzil", null=True, blank=True)
    user_agent = models.CharField("Qurilma (User-Agent)", max_length=300, blank=True)
    timestamp = models.DateTimeField("Vaqt", auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "Kirish tarixi"
        verbose_name_plural = "Kirish tarixi"
        ordering = ['-timestamp']

    def __str__(self):
        who = self.user.username if self.user else (self.username or 'noma`lum')
        return f"{who} — {self.get_event_display()} ({self.timestamp:%d.%m.%Y %H:%M})"


class SiteSettings(models.Model):
    site_title = models.CharField(max_length=255, default="Turkiy Yozma Yodgorliklar Korpusi")
    site_subtitle = models.CharField(max_length=500, default="VII–XI asrlardagi turkiy yozma merosning elektron to'plami")
    about_text = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sayt sozlamalari"
        verbose_name_plural = "Sayt sozlamalari"

    def __str__(self):
        return self.site_title
