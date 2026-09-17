import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.db.models import Sum
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings as django_settings
from .models import Monument, SiteSettings, MonumentSubmission, LoginActivity


# ── Custom actions ─────────────────────────────────────────────────────────────

@admin.action(description="✅ Tanlanganlarni 'Tanlangan' (featured) qilish")
def make_featured(modeladmin, request, queryset):
    updated = queryset.update(featured=True)
    modeladmin.message_user(request, f"{updated} ta yodgorlik 'Tanlangan' qilindi.")

@admin.action(description="❌ Tanlanganlardan 'Tanlangan' belgisini olish")
def remove_featured(modeladmin, request, queryset):
    updated = queryset.update(featured=False)
    modeladmin.message_user(request, f"{updated} ta yodgorlikdan 'Tanlangan' belgisi olindi.")

@admin.action(description="🔄 Ko'rishlar sonini nolga qaytarish")
def reset_views(modeladmin, request, queryset):
    updated = queryset.update(views=0)
    modeladmin.message_user(request, f"{updated} ta yodgorlikning ko'rishlar soni nolga qaytarildi.")

@admin.action(description="📥 CSV formatda eksport qilish")
def export_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="yodgorliklar.csv"'
    response.write('﻿')  # BOM for Excel UTF-8
    writer = csv.writer(response)
    writer.writerow(['ID', 'Nomi', 'Yil', 'Joy', 'Yozuv', 'Kategoriya',
                     'Til', "So'zlar", 'Qatorlar', 'Ko\'rishlar', 'Tanlangan'])
    for m in queryset:
        writer.writerow([m.id, m.title, m.year, m.location, m.script,
                         m.category, m.language, m.word_count,
                         m.line_count, m.views, m.featured])
    return response


# ── Monument Admin ─────────────────────────────────────────────────────────────

@admin.register(Monument)
class MonumentAdmin(admin.ModelAdmin):
    list_display = [
        'image_preview', 'title', 'year', 'script_badge',
        'category', 'location', 'word_count', 'views_count', 'featured'
    ]
    list_filter  = ['script', 'category', 'featured', 'language']
    search_fields = ['title', 'description', 'location', 'transliteration']
    list_editable = ['featured']
    ordering      = ['year']
    readonly_fields = ['views', 'created_at', 'updated_at', 'image_preview_large']
    actions = [make_featured, remove_featured, reset_views, export_csv]
    list_per_page = 20

    fieldsets = (
        ('📋 Asosiy ma\'lumotlar', {
            'fields': ('title', 'title_original', 'year', 'year_end',
                       'location', 'script', 'category', 'language', 'status')
        }),
        ('🖼️ Rasm', {
            'fields': ('image', 'image_preview_large'),
        }),
        ('📝 Matnlar', {
            'fields': ('description', 'significance', 'full_text',
                       'transliteration', 'translation'),
            'classes': ('collapse',),
        }),
        ('📊 Statistika', {
            'fields': ('word_count', 'line_count', 'importance',
                       'views', 'featured'),
        }),
        ('👥 Ilmiy ma\'lumotlar', {
            'fields': ('researchers', 'bibliography', 'tags'),
            'classes': ('collapse',),
        }),
        ('🕐 Vaqt tamg\'alari', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # ── Custom display methods ─────────────────────────────────────────────────

    @admin.display(description='Rasm')
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:48px;height:36px;object-fit:cover;'
                'border-radius:6px;border:1px solid #30363d;" onerror="this.style.display=\'none\'">',
                obj.image
            )
        return mark_safe('<span style="color:#484f58;font-size:11px">—</span>')

    @admin.display(description='Rasm (katta)')
    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:320px;max-height:200px;'
                'border-radius:8px;border:1px solid #30363d;" '
                'onerror="this.style.display=\'none\'">',
                obj.image
            )
        return "Rasm URL kiritilmagan"

    @admin.display(description='Yozuv')
    def script_badge(self, obj):
        colors = {
            'koktürk': '#d4a944',
            'sogd':    '#388bfd',
            "uyg'ur":  '#3fb950',
            'arab':    '#f85149',
            'boshqa':  '#8b949e',
        }
        color = colors.get(obj.script, '#8b949e')
        return format_html(
            '<span style="background:{}22;color:{};border:1px solid {}44;'
            'padding:2px 8px;border-radius:100px;font-size:11px;font-weight:600">{}</span>',
            color, color, color, obj.get_script_display()
        )

    @admin.display(description="Ko'rishlar", ordering='views')
    def views_count(self, obj):
        if obj.views > 200:
            color = '#3fb950'
        elif obj.views > 100:
            color = '#d4a944'
        else:
            color = '#8b949e'
        return format_html(
            '<span style="color:{};font-weight:600">👁 {}</span>',
            color, obj.views
        )

    @admin.display(description='Tanlangan', boolean=False, ordering='featured')
    def featured_toggle(self, obj):
        if obj.featured:
            return mark_safe('<span style="color:#3fb950;font-size:16px">★</span>')
        return mark_safe('<span style="color:#484f58;font-size:16px">☆</span>')

    # ── Summary stats at top of changelist ────────────────────────────────────
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        qs = self.get_queryset(request)
        agg = qs.aggregate(total_views=Sum('views'), total_words=Sum('word_count'))
        extra_context['summary_html'] = mark_safe(
            f'<div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">'
            f'<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;'
            f'padding:12px 20px;min-width:120px">'
            f'<div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px">Jami</div>'
            f'<div style="font-size:24px;font-weight:800;color:#d4a944">{qs.count()}</div></div>'
            f'<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;'
            f'padding:12px 20px;min-width:120px">'
            f'<div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px">Ko\'rishlar</div>'
            f'<div style="font-size:24px;font-weight:800;color:#388bfd">{agg["total_views"] or 0:,}</div></div>'
            f'<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;'
            f'padding:12px 20px;min-width:120px">'
            f'<div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px">So\'zlar</div>'
            f'<div style="font-size:24px;font-weight:800;color:#3fb950">{(agg["total_words"] or 0) // 1000}K+</div></div>'
            f'<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;'
            f'padding:12px 20px;min-width:120px">'
            f'<div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:1px">Tanlangan</div>'
            f'<div style="font-size:24px;font-weight:800;color:#f85149">'
            f'{qs.filter(featured=True).count()}</div></div>'
            f'</div>'
        )
        return super().changelist_view(request, extra_context=extra_context)


# ── SiteSettings Admin ─────────────────────────────────────────────────────────

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('🌐 Sayt ma\'lumotlari', {
            'fields': ('site_title', 'site_subtitle', 'about_text')
        }),
        ('📬 Bog\'lanish', {
            'fields': ('contact_email',)
        }),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()


# ── Admin site customization ───────────────────────────────────────────────────

# ── MonumentSubmission Admin ───────────────────────────────────────────────────

@admin.action(description="✅ Tasdiqlash va yodgorlik sifatida qo'shish")
def approve_submissions(modeladmin, request, queryset):
    count = 0
    site_url = request.build_absolute_uri(django_settings.FRONTEND_URL.rstrip('/') + '/monuments')
    for sub in queryset.filter(status='pending'):
        # Rasm: yuklangan fayl ustunlik qiladi, aks holda URL ishlatiladi
        image_url = sub.image
        if sub.image_file:
            # Frontend boshqa domenda (Vercel) — to'liq URL kerak
            image_url = request.build_absolute_uri(sub.image_file.url)

        monument = Monument.objects.create(
            title=sub.title,
            year=sub.year,
            location=sub.location,
            script=sub.script,
            category=sub.category,
            language=sub.language,
            description=sub.description,
            image=image_url,
            full_text=sub.full_text,
            transliteration=sub.transliteration,
            translation=sub.translation,
            bibliography=[sub.source_info] if sub.source_info else [],
            author_name=sub.author_name,
            author_email=sub.author_email,
            author_institution=sub.author_institution,
            is_user_submission=True,
            status='Chop etilgan',
            importance=3,
        )
        sub.status = 'approved'
        sub.reviewed_at = timezone.now()
        sub.monument = monument
        sub.save()
        send_mail(
            subject='Taklifingiz tasdiqlandi — Turkiy Korpus',
            message=(
                f'Assalomu alaykum, {sub.author_name}!\n\n'
                f'Yaxshi xabar! "{sub.title}" nomli yodgorlik taklifingiz admin tomonidan\n'
                f'tasdiqlandi va saytda chop etildi.\n\n'
                f'Saytda ko\'rish: {site_url}\n\n'
                f'Turkiy Yozma Yodgorliklar Elektron Korpusi'
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[sub.author_email],
            fail_silently=True,
        )
        count += 1
    modeladmin.message_user(request, f"{count} ta taklif tasdiqlandi va yodgorlik sifatida qo'shildi.")

@admin.action(description="❌ Rad etish")
def reject_submissions(modeladmin, request, queryset):
    count = 0
    for sub in queryset.filter(status='pending'):
        sub.status = 'rejected'
        sub.reviewed_at = timezone.now()
        sub.save()
        reject_reason = sub.reviewer_note or "Qo'shimcha ma'lumot yetarli emas"
        send_mail(
            subject='Taklifingiz ko\'rib chiqildi — Turkiy Korpus',
            message=(
                f'Assalomu alaykum, {sub.author_name}!\n\n'
                f'Afsuski, "{sub.title}" nomli yodgorlik taklifingiz\n'
                f'hozircha saytga kiritilmadi.\n\n'
                f'Sabab: {reject_reason}\n\n'
                f'Yangi ma\'lumotlar bilan qayta yuborishingiz mumkin.\n\n'
                f'Turkiy Yozma Yodgorliklar Elektron Korpusi'
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[sub.author_email],
            fail_silently=True,
        )
        count += 1
    modeladmin.message_user(request, f"{count} ta taklif rad etildi.")


@admin.register(MonumentSubmission)
class MonumentSubmissionAdmin(admin.ModelAdmin):
    list_display  = ['title', 'author_name', 'author_email', 'author_institution',
                     'script', 'year', 'status_badge', 'has_files', 'submitted_at']
    list_filter   = ['status', 'script', 'category']
    search_fields = ['title', 'author_name', 'author_email', 'description']
    readonly_fields = ['submitted_at', 'reviewed_at', 'monument', 'author_preview',
                       'image_preview_thumb', 'document_download']
    actions = [approve_submissions, reject_submissions]
    ordering = ['-submitted_at']
    list_per_page = 20

    fieldsets = (
        ('📋 Yodgorlik ma\'lumotlari', {
            'fields': ('title', 'year', 'location', 'script', 'category',
                       'language', 'description', 'image',
                       'image_file', 'image_preview_thumb',
                       'document', 'document_download',
                       'full_text', 'transliteration', 'translation', 'source_info')
        }),
        ('👤 Muallif', {
            'fields': ('author_preview', 'author_name', 'author_email',
                       'author_institution', 'author_bio')
        }),
        ('🔖 Holat', {
            'fields': ('status', 'reviewer_note', 'submitted_at',
                       'reviewed_at', 'monument')
        }),
    )

    @admin.display(description='Holat')
    def status_badge(self, obj):
        cfg = {
            'pending':  ('#d4a944', '#1c2128', '⏳ Kutilmoqda'),
            'approved': ('#3fb950', '#0d1117', '✅ Tasdiqlangan'),
            'rejected': ('#f85149', '#0d1117', '❌ Rad etilgan'),
        }
        color, bg, label = cfg.get(obj.status, ('#8b949e', '#0d1117', obj.status))
        return format_html(
            '<span style="background:{};color:{};padding:3px 10px;border-radius:100px;'
            'font-size:11px;font-weight:700">{}</span>',
            bg + '33', color, label
        )

    @admin.display(description='Fayllar')
    def has_files(self, obj):
        icons = []
        if obj.image_file:
            icons.append('<span title="Rasm bor" style="font-size:15px">🖼️</span>')
        if obj.document:
            icons.append('<span title="Hujjat bor" style="font-size:15px">📄</span>')
        return mark_safe(''.join(icons)) if icons else mark_safe('<span style="color:#484f58">—</span>')

    @admin.display(description='Rasm ko\'rinishi')
    def image_preview_thumb(self, obj):
        src = None
        if obj.image_file:
            src = obj.image_file.url
        elif obj.image:
            src = obj.image
        if src:
            return format_html(
                '<img src="{}" style="max-width:280px;max-height:160px;border-radius:8px;'
                'border:1px solid #30363d;" onerror="this.style.display=\'none\'">',
                src
            )
        return mark_safe('<span style="color:#484f58">Rasm yuklanmagan</span>')

    @admin.display(description='Hujjatni yuklab olish')
    def document_download(self, obj):
        if obj.document:
            name = obj.document.name.split('/')[-1]
            return format_html(
                '<a href="{}" download style="color:#388bfd;font-weight:600">'
                '📄 {} — yuklab olish</a>',
                obj.document.url, name
            )
        return mark_safe('<span style="color:#484f58">Hujjat yuklanmagan</span>')

    @admin.display(description='Muallif haqida')
    def author_preview(self, obj):
        return format_html(
            '<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:14px">'
            '<strong style="color:#d4a944">{}</strong><br>'
            '<span style="color:#8b949e">{}</span><br>'
            '<span style="color:#8b949e;font-size:12px">{}</span>'
            '</div>',
            obj.author_name, obj.author_email,
            obj.author_institution or '—'
        )


# ── LoginActivity Admin ────────────────────────────────────────────────────────

@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
    list_display   = ['who', 'event_badge', 'via_badge', 'ip', 'device', 'timestamp']
    list_filter    = ['event', 'via', 'timestamp']
    search_fields  = ['username', 'user__username', 'ip', 'user_agent']
    date_hierarchy = 'timestamp'
    ordering       = ['-timestamp']
    list_per_page  = 30

    # Tarix faqat o'qish uchun — qo'lda yozib/o'zgartirib bo'lmaydi
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.display(description='Foydalanuvchi', ordering='username')
    def who(self, obj):
        name = obj.user.username if obj.user else (obj.username or '—')
        if obj.user and obj.user.is_superuser:
            return format_html('{} <span style="color:#d4a944">👑</span>', name)
        return name

    @admin.display(description='Hodisa', ordering='event')
    def event_badge(self, obj):
        cfg = {
            'login':  ('#3fb950', '🟢 Kirdi'),
            'logout': ('#8b949e', '⚪ Chiqdi'),
            'failed': ('#f85149', '🔴 Xato urinish'),
        }
        color, label = cfg.get(obj.event, ('#8b949e', obj.event))
        return format_html(
            '<span style="background:{}22;color:{};border:1px solid {}44;'
            'padding:2px 10px;border-radius:100px;font-size:11px;font-weight:700">{}</span>',
            color, color, color, label
        )

    @admin.display(description='Qayerdan', ordering='via')
    def via_badge(self, obj):
        return '🌐 Sayt' if obj.via == 'api' else '⚙️ Admin panel'

    @admin.display(description='Qurilma')
    def device(self, obj):
        ua = obj.user_agent or ''
        browser = ('Edge' if 'Edg' in ua else 'Opera' if 'OPR' in ua else
                   'Chrome' if 'Chrome' in ua else 'Firefox' if 'Firefox' in ua else
                   'Safari' if 'Safari' in ua else '—')
        os_name = ('Android' if 'Android' in ua else
                   'iPhone/iPad' if ('iPhone' in ua or 'iPad' in ua) else
                   'Windows' if 'Windows' in ua else 'macOS' if 'Mac OS' in ua else
                   'Linux' if 'Linux' in ua else '')
        icon = '📱' if os_name in ('Android', 'iPhone/iPad') else '💻'
        return f"{icon} {browser}{' · ' + os_name if os_name else ''}"


# ── Admin site customization ───────────────────────────────────────────────────

admin.site.site_header  = "Turkiy Korpus — Boshqaruv Paneli"
admin.site.site_title   = "Turkiy Korpus Admin"
admin.site.index_title  = "Yodgorliklar boshqaruvi"
