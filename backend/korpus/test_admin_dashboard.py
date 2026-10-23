from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import RequestFactory, TestCase
from .admin_dashboard import dashboard_data
from .models import Book, ResearchWork, MonumentSubmission


class EditorialDashboardTests(TestCase):
    def setUp(self):
        self.editor = get_user_model().objects.create_user('book_editor', is_staff=True)
        self.owner = get_user_model().objects.create_superuser('studio_owner', password='test-admin-password-9351')
        Book.objects.create(title='Published book', author='Author', description='Text', published=True)
        Book.objects.create(title='Draft book', author='Author', description='Text')
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

    def test_book_view_permission_does_not_expose_other_models_or_add_actions(self):
        self.editor.user_permissions.add(Permission.objects.get(codename='view_book'))
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

    def test_superuser_dashboard_includes_real_publication_counts_and_both_queues(self):
        self.client.force_login(self.owner)
        response = self.client.get('/django-admin/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Tezkor amallar')
        self.assertContains(response, 'Private research')
        self.assertContains(response, 'Private suggestion')
        data = dashboard_data(self.request_for(self.owner))
        self.assertEqual(data['pending'], 2)
        book = next(item for item in data['cards'] if item['label'] == 'Elektron kitoblar')
        self.assertEqual((book['count'], book['published'], book['draft']), (2, 1, 1))

    def test_login_still_requires_authentication_and_contains_csrf(self):
        self.assertEqual(self.client.get('/django-admin/').status_code, 302)
        response = self.client.get('/django-admin/login/')
        self.assertContains(response, 'csrfmiddlewaretoken')
        self.assertContains(response, 'korpus/admin/studio.css')
