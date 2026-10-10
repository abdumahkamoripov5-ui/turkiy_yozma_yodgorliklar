from django.core import mail
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from .models import Monument, MonumentSubmission
from .csv_utils import safe_cell


def _submission_payload(**extra):
    data = {
        'title': 'Kültigin yodgorligi',
        'year': 732,
        'location': 'Arxangay',
        'script': 'koktürk',
        'category': 'bitiglar',
        'description': 'Kültigin yodgorligi haqida qisqa tavsif matni.',
        'author_name': 'Test Muallif',
        'author_email': 'author@example.com',
    }
    data.update(extra)
    return data


@override_settings(
    ADMIN_EMAIL='admin@example.com',
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
)
class SubmissionTests(TestCase):
    def setUp(self):
        self.client_api = APIClient()

    def test_title_with_newline_does_not_crash(self):
        # Sarlavhadagi yangi qator email subject'ni buzmasligi kerak (oldin 500 bo'lardi)
        r = self.client_api.post('/api/v2/submit/',
                                 _submission_payload(title='Birinchi qator\nIkkinchi qator'))
        self.assertEqual(r.status_code, 201)
        self.assertEqual(MonumentSubmission.objects.count(), 1)
        self.assertNotIn('\n', mail.outbox[0].subject)


class CsvSafeCellTests(TestCase):
    def test_formula_prefixes_are_neutralised(self):
        for value in ['=HYPERLINK("http://x")', '+1', '-2', '@SUM(A1)', '\tcmd', '\rcmd']:
            self.assertTrue(safe_cell(value).startswith("'"), value)

    def test_plain_values_untouched(self):
        self.assertEqual(safe_cell('Arxangay'), 'Arxangay')
        self.assertEqual(safe_cell(732), 732)
        self.assertEqual(safe_cell(None), None)


class ExportCsvTests(TestCase):
    def test_export_does_not_emit_formulas(self):
        Monument.objects.create(
            title='=1+1', year=700, location='@evil', script='koktürk',
            category='bitiglar', description='x' * 30, status='Chop etilgan',
        )
        r = APIClient().get('/api/v2/export/?format=csv')
        body = r.content.decode('utf-8-sig')
        self.assertIn("'=1+1", body)
        self.assertIn("'@evil", body)


class RefreshRotationTests(TestCase):
    def setUp(self):
        User.objects.create_user('editor', password='s3cret-pass-123')
        self.api = APIClient()

    def test_old_refresh_token_is_rejected_after_rotation(self):
        r = self.api.post('/api/v2/auth/token/',
                          {'username': 'editor', 'password': 's3cret-pass-123'}, format='json')
        self.assertEqual(r.status_code, 200)
        old_refresh = r.data['refresh']

        r2 = self.api.post('/api/v2/auth/token/refresh/', {'refresh': old_refresh}, format='json')
        self.assertEqual(r2.status_code, 200)
        self.assertIn('refresh', r2.data)

        # Rotatsiyadan keyin eski refresh token ishlamasligi kerak
        r3 = self.api.post('/api/v2/auth/token/refresh/', {'refresh': old_refresh}, format='json')
        self.assertEqual(r3.status_code, 401)
