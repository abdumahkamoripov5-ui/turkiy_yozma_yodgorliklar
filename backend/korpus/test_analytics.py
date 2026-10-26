from datetime import datetime, timedelta, timezone as dt_timezone
from unittest.mock import patch
import uuid

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.test import RequestFactory, TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from .analytics import usage_report
from .models import LoginActivity, PageView, SiteVisit, UserActivity


class AnalyticsTrackingTests(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        self.member = get_user_model().objects.create_user('analytics-member')

    def event(self, page='home', event_id=None, **extra):
        return self.api.post('/api/v2/analytics/event/', {
            'page': page, 'event_id': str(event_id or uuid.uuid4()), **extra}, format='json')

    def test_guest_tracking_and_retries_are_deduplicated(self):
        event = uuid.uuid4()
        response = self.event(event_id=event, url='https://example.test/?password=private')
        self.assertEqual(response.status_code, 204)
        self.assertTrue(response.cookies['meros_visitor']['httponly'])
        self.assertEqual(response.cookies['meros_visitor']['samesite'], 'Lax')
        self.event(event_id=event)
        self.event('register')
        self.assertEqual(PageView.objects.count(), 2)
        self.assertEqual(SiteVisit.objects.count(), 1)
        self.assertFalse(UserActivity.objects.exists())
        self.assertEqual(set(PageView.objects.values_list('page', flat=True)), {'home', 'register'})

    def test_expired_visit_keeps_visitor_but_starts_new_session(self):
        self.event()
        original = SiteVisit.objects.get()
        SiteVisit.objects.update(last_seen=timezone.now()-timedelta(minutes=31))
        self.event('login')
        self.assertEqual(SiteVisit.objects.count(), 2)
        self.assertEqual(set(SiteVisit.objects.values_list('visitor_key', flat=True)), {original.visitor_key})

    def test_forged_cookie_is_replaced_and_unknown_pages_rejected(self):
        self.api.cookies['meros_visitor'] = 'forged'
        self.assertEqual(self.event().status_code, 204)
        self.assertEqual(self.event('/words?q=secret').status_code, 400)
        self.assertEqual(self.event('words').status_code, 401)
        self.assertEqual(PageView.objects.count(), 1)

    def test_login_attributes_session_and_member_events_require_auth(self):
        self.event()
        self.api.force_authenticate(self.member)
        self.assertEqual(self.event('words').status_code, 204)
        self.assertEqual(SiteVisit.objects.count(), 1)
        self.assertEqual(SiteVisit.objects.get().user, self.member)
        self.assertEqual(PageView.objects.get(page='words').user, self.member)
        self.assertFalse(UserActivity.objects.exists(), 'Tracking endpoint must not log itself as feature usage')

    def test_staff_and_basic_bots_do_not_add_traffic(self):
        self.api.credentials(HTTP_USER_AGENT='ExampleCrawlerBot/1.0')
        self.assertEqual(self.event().status_code, 204)
        self.api.credentials()
        self.member.is_staff = True
        self.member.save()
        self.api.force_authenticate(self.member)
        self.assertEqual(self.event('words').status_code, 204)
        self.assertFalse(PageView.objects.exists())
        self.assertFalse(SiteVisit.objects.exists())


class AnalyticsReportsTests(TestCase):
    def setUp(self):
        cache.clear()
        self.owner = get_user_model().objects.create_superuser('analytics-owner')
        self.editor = get_user_model().objects.create_user('analytics-editor', is_staff=True)
        self.member = get_user_model().objects.create_user('report-member')
        self.now = datetime(2026, 10, 26, 11, tzinfo=dt_timezone.utc)
        self.url = reverse('admin:korpus_useractivity_report')

    def request(self, period='day', user=None):
        request = RequestFactory().get(self.url, {'report': period})
        request.user = user or self.owner
        return request

    def view(self, days=0, page='words', user=None, visitor=None, when=None):
        visit = SiteVisit.objects.create(visitor_key=visitor or uuid.uuid4(), user=user)
        entry = PageView.objects.create(visit=visit, event_key=uuid.uuid4(), user=user, page=page)
        PageView.objects.filter(pk=entry.pk).update(timestamp=when or self.now-timedelta(days=days))
        return entry

    def test_period_counts_zero_days_popularity_and_staff_exclusion(self):
        for days in [0, 2, 9, 31]:
            self.view(days, user=self.member)
        self.view(user=self.owner)
        self.view(page='monuments', user=self.member)
        with patch('korpus.analytics.timezone.now', return_value=self.now), timezone.override('Asia/Tashkent'):
            report = usage_report(self.request('month'))
        self.assertEqual([row['views'] for row in report['periods']], [2, 3, 4])
        self.assertEqual([row['visitors'] for row in report['periods']], [2, 3, 4])
        self.assertEqual(report['selected']['members'], 1)
        self.assertEqual(len(report['daily']), 30)
        self.assertEqual(sum(row['views'] for row in report['daily']), 4)
        self.assertEqual(report['popular'][0]['label'], 'Lug‘at')
        self.assertEqual(report['popular'][0]['views'], 3)

    def test_midnight_is_in_tashkent_and_visitors_are_distinct(self):
        visitor = uuid.uuid4()
        self.view(visitor=visitor, when=datetime(2026, 10, 25, 20, tzinfo=dt_timezone.utc))
        self.view(visitor=visitor, when=datetime(2026, 10, 26, 1, tzinfo=dt_timezone.utc))
        self.view(when=datetime(2026, 10, 25, 18, tzinfo=dt_timezone.utc))
        with patch('korpus.analytics.timezone.now', return_value=self.now), timezone.override('Asia/Tashkent'):
            report = usage_report(self.request())
        self.assertEqual(report['selected']['views'], 2)
        self.assertEqual(report['selected']['visitors'], 1)
        self.assertEqual(report['selected']['visits'], 2)

    def test_actions_exclude_auth_failed_requests_and_staff(self):
        for user, path, status in [(self.member, '/api/v2/monuments/concordance/', 200),
                                  (self.member, '/api/v2/monuments/concordance/', 400),
                                  (self.owner, '/api/v2/monuments/concordance/', 200),
                                  (self.member, '/api/v2/auth/token/', 200)]:
            event = UserActivity.objects.create(user=user, path=path, method='GET', status=status)
            UserActivity.objects.filter(pk=event.pk).update(timestamp=self.now)
        login = LoginActivity.objects.create(user=self.member, event='login', via='api')
        LoginActivity.objects.filter(pk=login.pk).update(timestamp=self.now)
        with patch('korpus.analytics.timezone.now', return_value=self.now):
            report = usage_report(self.request())
        self.assertEqual(report['api_usage'][0]['count'], 1)
        self.assertEqual(report['api_usage'][0]['members'], 1)
        self.assertEqual(report['selected']['api_members'], 1)
        self.assertEqual(report['selected']['logins'], 1)

    def test_report_permission_is_checked_even_when_cached(self):
        usage_report(self.request())
        self.assertIsNone(usage_report(self.request(user=self.editor)))
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.editor.user_permissions.add(Permission.objects.get(codename='view_useractivity'))
        self.assertEqual(self.client.get(self.url).status_code, 200)
        self.client.force_login(self.owner)
        response = self.client.get(self.url, {'report': 'month'})
        self.assertContains(response, 'Kunlik hisobot')
        self.assertContains(response, 'Oxirgi 30 kun')
        self.assertNotContains(response, self.member.username)

    def test_empty_report_is_zero_and_does_not_invent_past_traffic(self):
        report = usage_report(self.request('invalid'))
        self.assertEqual(report['selected']['key'], 'day')
        self.assertIsNone(report['tracked_since'])
        self.assertEqual(report['selected']['views'], 0)
