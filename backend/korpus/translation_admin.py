from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect, render
from django.urls import path, reverse
from django.utils import timezone

from .google_translation import (
    TranslationNotConfigured, TranslationProviderError, TranslationRateLimited,
    generate_interface_translation_batch,
)
from .models import InterfaceTranslation


@admin.register(InterfaceTranslation)
class InterfaceTranslationAdmin(admin.ModelAdmin):
    change_list_template = 'admin/korpus/interface_translation/change_list.html'
    list_display = ['key_preview', 'language', 'status', 'provider', 'generated_by', 'reviewed_by', 'updated_at']
    list_filter = ['language', 'status', 'provider', 'updated_at']
    search_fields = ['key', 'source_text', 'translated_text']
    readonly_fields = ['batch_id', 'generated_by', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']
    fields = ['key', 'source_text', 'language', 'translated_text', 'status', 'provider', 'batch_id', 'generated_by', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']
    ordering = ['status', 'language', 'key']

    @admin.display(description='Kalit / manba')
    def key_preview(self, obj):
        return obj.key[:90]

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if not request.user.has_perm('korpus.review_interfacetranslation'):
            fields.extend(['status', 'provider'])
        return fields

    def save_model(self, request, obj, form, change):
        can_review = request.user.has_perm('korpus.review_interfacetranslation')
        if can_review and obj.status == 'published':
            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()
        else:
            obj.status = 'draft'
            obj.reviewed_by = None
            obj.reviewed_at = None
        super().save_model(request, obj, form, change)

    def get_urls(self):
        custom = [path('google-draft/', self.admin_site.admin_view(self.google_draft_view), name='korpus_interfacetranslation_google_draft')]
        return custom + super().get_urls()

    def google_draft_view(self, request):
        if not self.has_add_permission(request) or not request.user.has_perm('korpus.use_google_translation'):
            raise PermissionDenied
        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Google orqali tarjima qoralamasi yaratish',
            'languages': InterfaceTranslation.LANGUAGE_CHOICES,
        }
        if request.method == 'POST':
            lines = [line for line in request.POST.get('items', '').splitlines() if line.strip()]
            items = []
            for line in lines:
                if '\t' in line:
                    key, source_text = line.split('\t', 1)
                else:
                    key = source_text = line
                items.append({'key': key.strip(), 'source_text': source_text})
            languages = request.POST.getlist('target_languages')
            total_chars = sum(len(item['source_text']) for item in items)
            duplicate_keys = len({item['key'] for item in items}) != len(items)
            if not items or len(items) > 30 or any(not item['key'] or len(item['key']) > 512 or not item['source_text'].strip() or len(item['source_text']) > 2000 for item in items) or total_chars > 5000:
                messages.error(request, '1–30 qator kiriting; manba matnlar jami 5 000 belgidan va har biri 2 000 belgidan oshmasin.')
            elif duplicate_keys:
                messages.error(request, 'Bir to‘plam ichida takroriy kalit bo‘lmasin.')
            elif not languages or len(set(languages)) != len(languages) or any(lang not in dict(InterfaceTranslation.LANGUAGE_CHOICES) for lang in languages):
                messages.error(request, 'Kamida bitta to‘g‘ri nishon tilini tanlang.')
            else:
                try:
                    _, results = generate_interface_translation_batch(items, languages, request.user)
                    created = sum(item['status'] == 'draft' for item in results)
                    messages.success(request, f'{created} ta qoralama yaratildi. Ular ekspert nashr etmaguncha saytda ko‘rinmaydi.')
                    return redirect(reverse('admin:korpus_interfacetranslation_changelist'))
                except TranslationNotConfigured:
                    messages.error(request, 'Google Cloud sozlanmagan. GOOGLE_TRANSLATE_PROJECT_ID va GOOGLE_TRANSLATE_CREDENTIALS_JSON ni serverga kiriting.')
                except TranslationRateLimited as exc:
                    messages.error(request, str(exc))
                except TranslationProviderError:
                    messages.error(request, 'Google tarjima xizmati javob bermadi; qoralamalar saqlanmadi.')
        return render(request, 'admin/korpus/interface_translation/google_draft.html', context)
