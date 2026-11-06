import uuid

from django.conf import settings
from django.db import models


class InterfaceTranslation(models.Model):
    LANGUAGE_CHOICES = [
        ('ru', 'Русский'), ('en', 'English'), ('tr', 'Türkçe'),
        ('tg', 'Тоҷикӣ (experimental Google support)'),
        ('ky', 'Кыргызча'), ('kk', 'Қазақша'),
    ]
    STATUS_CHOICES = [('draft', 'Qoralama'), ('published', 'Nashrda'), ('rejected', 'Rad etilgan')]
    PROVIDER_CHOICES = [('google', 'Google Cloud Translation'), ('manual', 'Qo‘lda kiritilgan')]

    key = models.CharField(max_length=512, verbose_name='Interfeys kaliti yoki o‘zbekcha matn')
    source_text = models.TextField(max_length=2000, verbose_name='Manba matn (o‘zbekcha)')
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, db_index=True)
    translated_text = models.TextField(max_length=4000, verbose_name='Tarjima')
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='draft', db_index=True)
    provider = models.CharField(max_length=10, choices=PROVIDER_CHOICES, default='google')
    batch_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='interface_translation_drafts')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_interface_translations')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Interfeys tarjimasi'
        verbose_name_plural = 'Interfeys tarjimalari'
        ordering = ['status', 'language', 'key']
        constraints = [models.UniqueConstraint(fields=['key', 'language'], name='unique_interface_translation_key_lang')]
        permissions = [
            ('use_google_translation', 'Can generate Google translation drafts'),
            ('review_interfacetranslation', 'Can review and publish interface translations'),
        ]

    def __str__(self):
        return f'{self.language}: {self.key[:70]}'
