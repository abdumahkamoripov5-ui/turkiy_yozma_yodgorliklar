from django.contrib import admin, messages
from django.core.exceptions import ValidationError

from .models import Book, WordEntry, MediaLesson, WordPoll, PollOption, PollVote, ResearchWork, SourceLink


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'language', 'is_sample', 'published']
    list_filter = ['published', 'is_sample', 'language']
    search_fields = ['title', 'author']


@admin.register(WordEntry)
class WordAdmin(admin.ModelAdmin):
    list_display = ['word', 'status', 'published']
    list_filter = ['status', 'published']
    search_fields = ['word', 'meaning']
    readonly_fields = ['campaign']


@admin.register(MediaLesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'audience', 'episode', 'published']
    list_filter = ['audience', 'published']
    filter_horizontal = ['words']


class OptionInline(admin.TabularInline):
    model = PollOption
    extra = 2

    def has_change_permission(self, request, obj=None):
        return not obj or not obj.votes.exists()

    def has_delete_permission(self, request, obj=None):
        return not obj or not obj.votes.exists()

    def has_add_permission(self, request, obj=None):
        return not obj or not obj.votes.exists()


@admin.register(WordPoll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['title', 'starts_at', 'ends_at', 'published', 'approved_at']
    inlines = [OptionInline]
    readonly_fields = ['approved_by', 'approved_at']

    @admin.action(description='Yakunlangan kampaniya g‘olibini lug‘atga qo‘shish')
    def approve(self, request, queryset):
        for poll in queryset:
            try:
                entry = poll.approve_winner(request.user)
                self.log_change(request, poll, f'G‘olib lug‘atga qo‘shildi: {entry.word}')
                self.message_user(request, f'{entry.word} lug‘atga qo‘shildi.')
            except ValidationError as exc:
                self.message_user(request, f'{poll.title}: {"; ".join(exc.messages)}', messages.ERROR)

    actions = [approve]


@admin.register(PollVote)
class VoteAdmin(admin.ModelAdmin):
    list_select_related = ['poll', 'option', 'user']
    list_display = ['poll', 'option', 'user', 'created_at']
    readonly_fields = ['poll', 'option', 'user', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ResearchWork)
class ResearchAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'institution', 'kind', 'status', 'created_at']
    list_filter = ['status', 'kind']
    search_fields = ['title', 'author', 'institution']
    readonly_fields = ['submitted_by', 'created_at', 'protected_document']
    exclude = ['document']

    def save_model(self, request, obj, form, change):
        if not obj.submitted_by_id:
            obj.submitted_by = request.user
        super().save_model(request, obj, form, change)

    @admin.display(description='Yuklangan PDF')
    def protected_document(self, obj):
        from django.utils.html import format_html
        if obj.document:
            return format_html('<a href="/api/v2/research/{}/document/">PDF faylni ochish</a>', obj.pk)
        return 'Fayl yuklanmagan'


@admin.register(SourceLink)
class SourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'url', 'published']
