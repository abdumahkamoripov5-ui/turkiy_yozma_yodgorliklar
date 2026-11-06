from django.contrib import admin, messages
from django.utils import timezone


@admin.action(description='Tanlangan matnlarni ilmiy tasdiqlash', permissions=['review'])
def approve_scientific_content(modeladmin, request, queryset):
    if not modeladmin.has_review_permission(request):
        from django.core.exceptions import PermissionDenied
        raise PermissionDenied
    ready = []
    for item in queryset:
        required = ('source', 'transliteration', 'translation') if hasattr(item, 'transliteration') else ('source', 'meaning')
        if not item.published or any(not getattr(item, key, '').strip() for key in required):
            modeladmin.message_user(request, 'Avval nashr, manba va matn qatlamlarini to‘ldiring.', level=messages.ERROR)
            return
        ready.append(item.pk)
    queryset.filter(pk__in=ready).update(reviewed_by=request.user, reviewed_at=timezone.now())
    modeladmin.message_user(request, f'{len(ready)} ta yozuvning ilmiy tasdig‘i tekshiruvchi va vaqt bilan qayd etildi.')


class ScientificReviewMixin:
    def has_review_permission(self, request):
        return request.user.has_perm(f'{self.model._meta.app_label}.review_{self.model._meta.model_name}')
