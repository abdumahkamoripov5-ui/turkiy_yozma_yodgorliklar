"""Permission-aware data for the editorial dashboard."""
from django.contrib import admin
from django.contrib.admin.models import LogEntry
from django.db.models import Count, Q
from django.urls import reverse
from django.utils import timezone
from .models import Monument, Book, MediaLesson, WordEntry, WordPoll, ResearchWork, MonumentSubmission, SourceLink


def dashboard_data(request):
    result = {'cards': [], 'sections': [], 'actions': [], 'queue': [], 'pending': 0,
              'total': 0, 'published': 0, 'active_polls': 0, 'activity': []}
    if not request or not request.user.is_active or not request.user.is_staff:
        return result
    definitions = [
        (Monument, 'Yodgorliklar', 'Yodgorlik qo‘shish', '𐰴', 'sage', Q(status='Chop etilgan')),
        (Book, 'Elektron kitoblar', 'Kitob qo‘shish', '▤', 'blue', Q(published=True)),
        (MediaLesson, 'Video darslar', 'Dars qo‘shish', '▷', 'peach', Q(published=True)),
        (WordEntry, 'Lug‘at so‘zlari', 'So‘z qo‘shish', 'Aa', 'gold', Q(published=True)),
        (WordPoll, 'Ovoz kampaniyalari', 'Kampaniya qo‘shish', '◉', 'sage', Q(published=True)),
        (SourceLink, 'Tashqi manbalar', 'Manba qo‘shish', '↗', 'blue', Q(published=True)),
    ]
    for model, label, action, icon, tone, published_filter in definitions:
        model_admin = admin.site._registry[model]
        opts = model._meta
        prefix = f'admin:{opts.app_label}_{opts.model_name}'
        if model_admin.has_add_permission(request):
            result['actions'].append({'label': action, 'icon': icon, 'url': reverse(f'{prefix}_add')})
        if not model_admin.has_view_or_change_permission(request):
            continue
        queryset = model_admin.get_queryset(request)
        aggregates = {'total': Count('pk'), 'published_count': Count('pk', filter=published_filter)}
        if model is WordPoll:
            now = timezone.now()
            aggregates['active'] = Count('pk', filter=Q(published=True, starts_at__lte=now, ends_at__gt=now))
        counts = queryset.aggregate(**aggregates)
        row = {'label': label, 'icon': icon, 'tone': tone, 'url': reverse(f'{prefix}_changelist'),
               'count': counts['total'], 'published': counts['published_count'],
               'draft': counts['total'] - counts['published_count'],
               'percent': round(100 * counts['published_count'] / counts['total']) if counts['total'] else 0}
        result['sections'].append(row)
        if model in (Monument, Book, MediaLesson, WordEntry):
            result['cards'].append(row)
        result['total'] += counts['total']
        result['published'] += counts['published_count']
        result['active_polls'] += counts.get('active', 0)
    for model, kind, date_field in ((ResearchWork, 'Ilmiy ish', 'created_at'), (MonumentSubmission, 'Yodgorlik taklifi', 'submitted_at')):
        model_admin = admin.site._registry[model]
        if not model_admin.has_view_or_change_permission(request):
            continue
        queryset = model_admin.get_queryset(request).filter(status='pending')
        result['pending'] += queryset.count()
        opts = model._meta
        for item in queryset.order_by(date_field)[:4]:
            result['queue'].append({'title': item.title, 'kind': kind, 'date': getattr(item, date_field),
                'url': reverse(f'admin:{opts.app_label}_{opts.model_name}_change', args=[item.pk])})
    result['queue'] = sorted(result['queue'], key=lambda row: row['date'])[:5]
    result['percent'] = round(100 * result['published'] / result['total']) if result['total'] else 0
    result['draft'] = result['total'] - result['published']
    for entry in LogEntry.objects.filter(user=request.user).select_related('content_type').order_by('-action_time')[:6]:
        model = entry.content_type.model_class() if entry.content_type else None
        model_admin = admin.site._registry.get(model)
        if not model_admin or not model_admin.has_view_or_change_permission(request):
            continue
        result['activity'].append({'title': entry.object_repr, 'date': entry.action_time,
            'label': 'Qo‘shildi' if entry.is_addition() else 'O‘chirildi' if entry.is_deletion() else 'Tahrirlandi',
            'url': None if entry.is_deletion() else entry.get_admin_url()})
    return result
