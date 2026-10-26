from django.contrib import admin
from django.utils import timezone
from .models import WordForm, ReadingVariant


class ReviewedAdmin(admin.ModelAdmin):
    readonly_fields = ['reviewed_by', 'reviewed_at']

    def save_model(self, request, obj, form, change):
        approved = getattr(obj, 'reviewed', obj.published)
        if approved:
            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()
        else:
            obj.reviewed_by = None
            obj.reviewed_at = None
        super().save_model(request, obj, form, change)


@admin.register(WordForm)
class WordFormAdmin(ReviewedAdmin):
    list_display = ['form', 'lemma', 'part_of_speech', 'source', 'reviewed', 'published']
    search_fields = ['form', 'lemma', 'root', 'source']
    list_filter = ['reviewed', 'published', 'part_of_speech']
    autocomplete_fields = ['word']
    fieldsets = [
        ('So‘z va tahlil', {'fields': ['form', 'lemma', 'word', 'part_of_speech', 'root', 'segmentation', 'features']}),
        ('Manba va tekshiruv', {'fields': ['source', 'reviewed', 'published', 'reviewed_by', 'reviewed_at']}),
    ]


@admin.register(ReadingVariant)
class ReadingVariantAdmin(ReviewedAdmin):
    list_display = ['line', 'scholar', 'certainty', 'source', 'published']
    list_filter = ['published', 'certainty']
    search_fields = ['line__monument__title', 'scholar', 'source', 'reading']
    raw_id_fields = ['line']
    fieldsets = [
        ('O‘qilish varianti', {'fields': ['line', 'scholar', 'reading', 'translation', 'certainty', 'note']}),
        ('Manba va tekshiruv', {'fields': ['source', 'published', 'reviewed_by', 'reviewed_at']}),
    ]
