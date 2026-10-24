import io

from django.core import mail
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from PIL import Image
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
        cache.clear()  # throttle holati testlar orasida ulashilmasin
        self.client_api = APIClient()
        self.client_api.force_authenticate(User.objects.create_user('contributor'))

    def test_title_with_newline_does_not_crash(self):
        # Sarlavhadagi yangi qator email subject'ni buzmasligi kerak (oldin 500 bo'lardi)
        r = self.client_api.post('/api/v2/submit/',
                                 _submission_payload(title='Birinchi qator\nIkkinchi qator'))
        self.assertEqual(r.status_code, 201)
        self.assertEqual(MonumentSubmission.objects.count(), 1)
        self.assertNotIn('\n', mail.outbox[0].subject)

    def test_no_receipt_email_sent_to_author(self):
        # Forma ixtiyoriy manzilga xat yubormasligi kerak (email relay'ga yo'l qo'ymaslik)
        self.client_api.post('/api/v2/submit/', _submission_payload())
        recipients = [addr for m in mail.outbox for addr in m.to]
        self.assertNotIn('author@example.com', recipients)
        self.assertIn('admin@example.com', recipients)


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
        client = APIClient()
        client.force_authenticate(User.objects.create_user('exporter'))
        r = client.get('/api/v2/export/?format=csv')
        body = r.content.decode('utf-8-sig')
        self.assertIn("'=1+1", body)
        self.assertIn("'@evil", body)


class RefreshRotationTests(TestCase):
    def setUp(self):
        cache.clear()
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


def _png_bytes():
    buf = io.BytesIO()
    Image.new('RGB', (4, 4), (200, 10, 10)).save(buf, format='PNG')
    return buf.getvalue()


@override_settings(ADMIN_EMAIL='', EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class UploadContentTests(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        self.api.force_authenticate(User.objects.create_user('contributor'))

    def _submit(self, **files):
        data = _submission_payload()
        data.update(files)
        return self.api.post('/api/v2/submit/', data, format='multipart')

    def test_real_png_accepted(self):
        r = self._submit(image_file=SimpleUploadedFile('a.png', _png_bytes(), 'image/png'))
        self.assertEqual(r.status_code, 201)

    def test_fake_image_rejected(self):
        # Kengaytma .png, lekin mazmun HTML — rad etilishi kerak
        fake = SimpleUploadedFile('a.png', b'<script>alert(1)</script>', 'image/png')
        r = self._submit(image_file=fake)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(MonumentSubmission.objects.count(), 0)

    def test_document_with_wrong_signature_rejected(self):
        fake = SimpleUploadedFile('a.pdf', b'not a pdf at all', 'application/pdf')
        r = self._submit(document=fake)
        self.assertEqual(r.status_code, 400)

    def test_real_pdf_accepted(self):
        pdf = SimpleUploadedFile('a.pdf', b'%PDF-1.4\n%%EOF', 'application/pdf')
        r = self._submit(document=pdf)
        self.assertEqual(r.status_code, 201)

    def test_binary_txt_rejected(self):
        bad = SimpleUploadedFile('a.txt', bytes([0, 1, 2]) + b'binary', 'text/plain')
        r = self._submit(document=bad)
        self.assertEqual(r.status_code, 400)


class MonumentApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        self.api.force_authenticate(User.objects.create_user('reader'))
        self.published = Monument.objects.create(
            title='Kültigin', year=732, location='Arxangay', script='koktürk',
            category='bitiglar', description='x' * 30, status='Chop etilgan',
            transliteration='Tengri yaratdi', translation='Osmon yaratdi',
        )
        self.draft = Monument.objects.create(
            title='Qoralama', year=800, location='Turfon', script='arab',
            category='diniy', description='x' * 30, status='Qoralama',
        )

    def test_stats_endpoint(self):
        r = self.api.get('/api/v2/monuments/stats/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['total'], 1)  # faqat chop etilgan

    def test_drafts_hidden_from_members(self):
        r = self.api.get('/api/v2/monuments/')
        titles = [m['title'] for m in r.data['results']]
        self.assertIn('Kültigin', titles)
        self.assertNotIn('Qoralama', titles)

    def test_drafts_visible_to_staff_with_flag(self):
        staff = User.objects.create_user('chief', password='s3cret-pass-123', is_staff=True)
        self.api.force_authenticate(staff)
        r = self.api.get('/api/v2/monuments/?include_drafts=1')
        titles = [m['title'] for m in r.data['results']]
        self.assertIn('Qoralama', titles)

    def test_anonymous_cannot_write(self):
        self.api.force_authenticate(None)
        r = self.api.post('/api/v2/monuments/', {'title': 'x'}, format='json')
        self.assertIn(r.status_code, (401, 403))
        r = self.api.delete(f'/api/v2/monuments/{self.published.pk}/')
        self.assertIn(r.status_code, (401, 403))
        self.assertTrue(Monument.objects.filter(pk=self.published.pk).exists())

    def test_concordance_finds_and_cache_is_invalidated(self):
        r = self.api.get('/api/v2/monuments/concordance/', {'q': 'Tengri'})
        self.assertEqual(r.data['count'], 1)
        # Matn o'zgarganda kesh eskirishi kerak (content_version)
        self.published.transliteration = 'Boshqa matn'
        self.published.save()
        r = self.api.get('/api/v2/monuments/concordance/', {'q': 'Tengri'})
        self.assertEqual(r.data['count'], 0)

    def test_concordance_requires_two_chars(self):
        r = self.api.get('/api/v2/monuments/concordance/', {'q': 'a'})
        self.assertEqual(r.status_code, 400)

    def test_word_frequency_limit_validation(self):
        r = self.api.get('/api/v2/monuments/word-frequency/', {'limit': 'abc'})
        self.assertEqual(r.status_code, 400)
        r = self.api.get('/api/v2/monuments/word-frequency/', {'limit': 5})
        self.assertLessEqual(r.data['count'], 5)
