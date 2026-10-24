from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib import admin
from django.test import RequestFactory, TestCase
from .admin_dashboard import dashboard_data
from .models import Book, ResearchWork, MonumentSubmission, WordEntry
from .templatetags.admin_extras import studio_navigation


class EditorialDashboardTests(TestCase):
    def setUp(self):
        self.editor = get_user_model().objects.create_user('book_editor', is_staff=True)
        self.owner = get_user_model().objects.create_superuser('studio_owner', password='test-admin-password-9351')
        Book.objects.create(title='Published book', author='Author', description='Text', published=True)
        Book.objects.create(title='Draft book', author='Author', description='Text')
        WordEntry.objects.create(word='el', meaning='People', source='Edition', published=True)
        WordEntry.objects.create(word='bodun', meaning='People', source='Edition')
        ResearchWork.objects.create(title='Private research', author='Researcher', abstract='Private',
                                    submitted_by=self.owner, kind='article')
        MonumentSubmission.objects.create(title='Private suggestion', year=700, author_email='author@example.test')

    def request_for(self, user):
        request = RequestFactory().get('/django-admin/')
        request.user = user
        return request

    def test_staff_without_permissions_sees_no_counts_or_private_queue(self):
        data = dashboard_data(self.request_for(self.editor))
        self.assertEqual(data['cards'], [])
        self.assertEqual(data['pending'], 0)
        self.assertEqual(data['queue'], [])
        self.assertEqual(data['actions'], [])

    def test_word_view_permission_does_not_expose_other_models_or_add_actions(self):
        self.editor.user_permissions.add(Permission.objects.get(codename='view_wordentry'))
        data = dashboard_data(self.request_for(self.editor))
        self.assertEqual(len(data['cards']), 1)
        self.assertEqual(data['total'], 2)
        self.assertEqual(data['published'], 1)
        self.assertEqual(data['queue'], [])
        self.assertEqual(data['actions'], [])
        self.client.force_login(self.editor)
        response = self.client.get('/django-admin/')
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Private research')
        self.assertNotContains(response, 'Private suggestion')

    def test_superuser_dashboard_includes_only_mvp_counts_and_suggestions(self):
        self.client.force_login(self.owner)
        response = self.client.get('/django-admin/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Tezkor amallar')
        self.assertNotContains(response, 'Private research')
        self.assertContains(response, 'Private suggestion')
        data = dashboard_data(self.request_for(self.owner))
        self.assertEqual(data['pending'], 1)
        self.assertEqual(len(data['cards']), 3)
        word = next(item for item in data['cards'] if item['label'] == 'Lug‘at so‘zlari')
        self.assertEqual((word['count'], word['published'], word['draft']), (2, 1, 1))

    def test_archived_sections_have_no_admin_routes_and_keep_records(self):
        self.client.force_login(self.owner)
        for app, model in [('korpus', name) for name in ['book', 'medialesson', 'researchwork', 'pollvote']] + [
                ('token_blacklist', 'outstandingtoken'), ('token_blacklist', 'blacklistedtoken')]:
            self.assertEqual(self.client.get(f'/django-admin/{app}/{model}/').status_code, 404)
        self.assertEqual(Book.objects.count(), 2)
        self.assertEqual(ResearchWork.objects.count(), 1)

    def test_navigation_keeps_core_sections_and_folds_secondary_tools(self):
        request = self.request_for(self.owner)
        data = studio_navigation({'request': request, 'available_apps': admin.site.get_app_list(request)})
        self.assertEqual([item['object_name'] for item in data['core']],
                         ['Monument', 'WordEntry', 'WordPoll', 'MonumentSubmission'])
        self.assertFalse(data['extra_open'])
        self.assertTrue(any(item['object_name'] == 'User' for item in data['extra']))
        request.path = '/django-admin/auth/user/'
        self.assertTrue(studio_navigation({'request': request,
                        'available_apps': admin.site.get_app_list(request)})['extra_open'])

    def test_login_still_requires_authentication_and_contains_csrf(self):
        self.assertEqual(self.client.get('/django-admin/').status_code, 302)
        response = self.client.get('/django-admin/login/')
        self.assertContains(response, 'csrfmiddlewaretoken')
        self.assertContains(response, 'korpus/admin/studio.css')
