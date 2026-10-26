"""First-party navigation counts. No IP, raw URL, query, fingerprint or form data."""
from datetime import datetime, time, timedelta
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, Min, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import LoginActivity, PageView, SiteVisit, UserActivity
from .throttling import ScopedRateThrottle

PAGES = {
    'home': 'Bosh sahifa', 'register': 'Hisob ochish', 'login': 'Kirish',
    'explore': 'Meros sayohati', 'monuments': 'Yodgorliklar', 'words': 'Lug‘at',
    'tools': 'Tadqiqot vositalari', 'polls': 'Ovoz berish', 'saved': 'Saqlanganlar',
    'sources': 'Manbalar', 'timeline': 'Vaqt chizig‘i', 'map': 'Xarita',
    'scripts': 'Yozuvlar', 'stats': 'Korpus statistikasi', 'concordance': 'Konkordans',
    'compare': 'Matnlarni solishtirish', 'bibliography': 'Bibliografiya', 'glossary': 'Glossariy',
    'recommended-words': 'Tavsiya so‘zlar', 'frequent-words': 'Ko‘p uchraydigan so‘zlar',
    'submit': 'Taklif yuborish', 'about': 'Loyiha haqida',
}
PUBLIC_PAGES = {'home', 'register', 'login'}
VISITOR_COOKIE = 'meros_visitor'
SESSION_COOKIE = 'meros_visit'


class EventSerializer(serializers.Serializer):
    page = serializers.ChoiceField(choices=list(PAGES))
    event_id = serializers.UUIDField()


def cookie_uuid(request, name, max_age):
    try:
        return uuid.UUID(request.get_signed_cookie(name, salt='meros-analytics', max_age=max_age))
    except (KeyError, ValueError, signing.BadSignature):
        return None


class PageEventView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'analytics'

    def post(self, request):
        serializer = EventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        page = serializer.validated_data['page']
        user = request.user if request.user.is_authenticated else None
        if page not in PUBLIC_PAGES and not user:
            return Response(status=401)
        agent = request.META.get('HTTP_USER_AGENT', '').lower()
        if (user and (user.is_staff or user.is_superuser)) or any(word in agent for word in ['bot', 'crawler', 'spider']):
            return Response(status=204)
        visitor = cookie_uuid(request, VISITOR_COOKIE, 365 * 86400) or uuid.uuid4()
        session = cookie_uuid(request, SESSION_COOKIE, 1800)
        now = timezone.now()
        with transaction.atomic():
            visit = SiteVisit.objects.select_for_update().filter(session_key=session, visitor_key=visitor,
                        last_seen__gte=now-timedelta(minutes=30)).first() if session else None
            if visit and user and visit.user_id not in (None, user.pk):
                visit = None
            if visit is None:
                visit = SiteVisit.objects.create(visitor_key=visitor, user=user)
            else:
                visit.last_seen = now
                if user:
                    visit.user = user
                visit.save(update_fields=['last_seen', 'user'])
            PageView.objects.get_or_create(event_key=serializer.validated_data['event_id'],
                                          defaults={'visit': visit, 'user': user, 'page': page})
        response = Response(status=204)
        for name, value, age in [(VISITOR_COOKIE, visitor, 365*86400), (SESSION_COOKIE, visit.session_key, 1800)]:
            response.set_signed_cookie(name, str(value), salt='meros-analytics', max_age=age,
                                       httponly=True, secure=not settings.DEBUG, samesite='Lax')
        return response


def usage_report(request):
    if not request or not request.user.is_active or not request.user.is_staff or not request.user.has_perm('korpus.view_useractivity'):
        return None
    period = request.GET.get('report', 'day')
    if period not in ('day', 'week', 'month'):
        period = 'day'
    today = timezone.localdate()
    key = f'usage-report-v1:{today}:{period}'
    cached = cache.get(key)
    if cached is not None:
        return cached
    now = timezone.now()
    midnight = timezone.make_aware(datetime.combine(today, time.min))
    pages = PageView.objects.filter(timestamp__lte=now).exclude(visit__user__is_staff=True).exclude(user__is_staff=True)
    actions = UserActivity.objects.filter(timestamp__lte=now, user__is_staff=False,
                                         status__gte=200, status__lt=400).exclude(path__startswith='/api/v2/auth/')
    logins = LoginActivity.objects.filter(via='api', event='login', user__is_staff=False, timestamp__lte=now)
    users = get_user_model().objects.filter(is_staff=False, is_superuser=False, date_joined__lte=now)
    periods = []
    for name, days, label in [('day', 1, 'Bugun'), ('week', 7, 'Oxirgi 7 kun'), ('month', 30, 'Oxirgi 30 kun')]:
        start = midnight - timedelta(days=days-1)
        counts = pages.filter(timestamp__gte=start).aggregate(visitors=Count('visit__visitor_key', distinct=True),
                    visits=Count('visit_id', distinct=True), views=Count('pk'), members=Count('user_id', distinct=True))
        counts.update(key=name, label=label, days=days, start=start,
                      logins=logins.filter(timestamp__gte=start).count(),
                      new_accounts=users.filter(date_joined__gte=start).count(),
                      api_members=actions.filter(timestamp__gte=start).values('user_id').distinct().count())
        periods.append(counts)
    selected = next(row for row in periods if row['key'] == period)
    current = pages.filter(timestamp__gte=selected['start'])
    popular = list(current.values('page').annotate(views=Count('pk'), visitors=Count('visit__visitor_key', distinct=True),
                   members=Count('user_id', distinct=True)).order_by('-views', 'page'))
    maximum = max([row['views'] for row in popular], default=1)
    for row in popular:
        row['label'] = PAGES.get(row['page'], row['page'])
        row['percent'] = round(row['views'] / maximum * 100)
    grouped = {row['date']: row for row in current.annotate(date=TruncDate('timestamp', tzinfo=timezone.get_current_timezone()))
               .values('date').annotate(views=Count('pk'), visitors=Count('visit__visitor_key', distinct=True),
                                       visits=Count('visit_id', distinct=True))}
    daily = []
    for offset in range(selected['days']):
        date = selected['start'].date() + timedelta(days=offset)
        daily.append({'date': date, **{name: grouped.get(date, {}).get(name, 0) for name in ['views', 'visitors', 'visits']}})
    peak = max([row['views'] for row in daily], default=0) or 1
    for row in daily:
        row['height'] = round(row['views'] / peak * 100)
    api_usage = []
    recent = actions.filter(timestamp__gte=selected['start'])
    for label, condition in [
        ('Konkordans qidiruvi', Q(path__startswith='/api/v2/monuments/concordance/')),
        ('Lug‘atdan aniq izlash', Q(path__startswith='/api/v2/words/lookup/')),
        ('Eksport / yuklab olish', Q(path__startswith='/api/v2/export/')),
        ('Ovoz berish', Q(method='POST', path__regex=r'^/api/v2/polls/\d+/vote/$')),
        ('Taklif yuborish', Q(method='POST', path='/api/v2/submit/')),
    ]:
        counts = recent.filter(condition).aggregate(count=Count('pk'), members=Count('user_id', distinct=True))
        api_usage.append({'label': label, **counts})
    report = {'periods': periods, 'selected': selected, 'popular': popular, 'daily': daily,
              'api_usage': api_usage, 'tracked_since': pages.aggregate(first=Min('timestamp'))['first'],
              'timezone': str(timezone.get_current_timezone())}
    cache.set(key, report, 60)
    return report
