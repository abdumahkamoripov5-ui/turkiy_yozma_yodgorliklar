"""Account-owned research and source-backed editorial annotations."""
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class ResearchItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='research_items')
    key = models.CharField(max_length=180)
    kind = models.CharField(max_length=20, choices=[('bookmark', 'Saqlangan'), ('note', 'Qayd'), ('query', 'Qidiruv'), ('progress', 'O‘qish joyi')], default='bookmark')
    title = models.CharField(max_length=250)
    target = models.CharField(max_length=2000, blank=True)
    collection = models.CharField('To‘plam', max_length=100, blank=True)
    note = models.TextField('Shaxsiy izoh', blank=True, max_length=10000)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-id']
        constraints = [models.UniqueConstraint(fields=['user', 'key'], name='unique_user_research_key')]
        indexes = [models.Index(fields=['user', 'kind'], name='research_user_kind')]
        verbose_name = 'Shaxsiy tadqiqot yozuvi'
        verbose_name_plural = 'Shaxsiy tadqiqot yozuvlari'

    def __str__(self):
        return self.title


class WordForm(models.Model):
    form = models.CharField('Matndagi shakl', max_length=150)
    lemma = models.CharField('Bosh shakl (lemma)', max_length=150)
    part_of_speech = models.CharField('So‘z turkumi', max_length=80, blank=True)
    root = models.CharField('O‘zak', max_length=150, blank=True)
    segmentation = models.CharField('O‘zak va qo‘shimchalar', max_length=300, blank=True)
    features = models.CharField('Grammatik belgilar', max_length=500, blank=True)
    source = models.CharField('Manba va sahifa', max_length=1000)
    word = models.ForeignKey('korpus.WordEntry', null=True, blank=True, on_delete=models.SET_NULL, related_name='forms')
    reviewed = models.BooleanField('Ekspert tekshirgan', default=False)
    published = models.BooleanField('Nashr qilish', default=False)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['lemma', 'form', 'id']
        verbose_name = 'Morfologik tahlil'
        verbose_name_plural = 'Morfologik tahlillar'

    def clean(self):
        if self.published and (not self.reviewed or not self.source.strip()):
            raise ValidationError('Nashr uchun ekspert tekshiruvi va manba kerak.')

    def __str__(self):
        return f'{self.form} → {self.lemma}'


class ReadingVariant(models.Model):
    line = models.ForeignKey('korpus.MonumentLine', on_delete=models.CASCADE, related_name='variants')
    scholar = models.CharField('Olim / nashr muallifi', max_length=250)
    reading = models.TextField('O‘qilish varianti')
    translation = models.TextField('Tarjima', blank=True)
    source = models.CharField('Nashr, yil va sahifa', max_length=1000)
    note = models.TextField('Ilmiy izoh', blank=True)
    certainty = models.CharField('O‘qilish holati', max_length=20, choices=[('certain', 'Aniq'), ('uncertain', 'Noaniq'), ('restored', 'Tiklangan')], default='certain')
    published = models.BooleanField('Ekspert tekshirgan va nashr qilingan', default=False)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['line__position', 'scholar', 'id']
        verbose_name = 'Ilmiy o‘qilish varianti'
        verbose_name_plural = 'Ilmiy o‘qilish variantlari'

    def clean(self):
        if self.published and (not self.scholar.strip() or not self.source.strip()):
            raise ValidationError('Nashr uchun muallif va manba kerak.')

    def __str__(self):
        return f'{self.line} · {self.scholar}'
