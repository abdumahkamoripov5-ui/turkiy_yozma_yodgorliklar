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
    list_display = ['word', 'status', 'published', 'reviewed_by', 'reviewed_at']
    list_filter = ['status', 'published']
    search_fields = ['word', 'meaning']
    readonly_fields = ['campaign', 'reviewed_by', 'reviewed_at']

    def save_model(self, request, obj, form, change):
        from django.utils import timezone
        if obj.published:
            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()
        else:
            obj.reviewed_by = None
            obj.reviewed_at = None
        super().save_model(request, obj, form, change)


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

    @admin.action(description='Ijtimoiy tarmoq uchun post matnlarini yuklab olish')
    def social_drafts(self, request, queryset):
        from django.http import HttpResponse
        from django.conf import settings
        blocks = []
        for poll in queryset.prefetch_related('options').order_by('starts_at', 'pk'):
            options = '\n'.join(f'{index}. {option.word} — {option.explanation}\nManba: {option.source}'
                                for index, option in enumerate(poll.options.all(), 1))
            blocks.append(f'TURKIY MEROS · SO‘ZNING ERTASI SIZ BILAN\n\n{poll.title}\n{poll.context}\n\n'
                          f'{options}\n\nOvoz bering: {settings.FRONTEND_URL.rstrip("/")}/polls\n'
                          f'Muddat: {poll.ends_at:%d.%m.%Y}\n'
                          'Jamoatchilik tanlovi. Lug‘atga kiritishdan oldin ekspert tekshiradi.\n'
                          '#TurkiyMeros #SozningErtasi')
        response = HttpResponse('\n\n──────────\n\n'.join(blocks), content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="turkiy-meros-postlar.txt"'
        return response

    actions = [approve, social_drafts]


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
