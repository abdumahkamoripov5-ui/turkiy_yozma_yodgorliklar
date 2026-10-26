from io import BytesIO
from tempfile import TemporaryDirectory

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from openpyxl import Workbook

from .admin_forms import WordAdminForm
from .models import WordEntry
from .mvp_api import WordSerializer
from .word_import import parse_workbook


def excel(rows):
    book = Workbook()
    for row in rows:
        book.active.append(row)
    output = BytesIO()
    book.save(output)
    return SimpleUploadedFile('words.xlsx', output.getvalue())


class WordImportTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_superuser('editor', password='test-password')
        self.client.force_login(self.admin)
        self.url = reverse('admin:korpus_wordentry_import')

    def test_preview_confirm_drafts_duplicates_and_replay(self):
        WordEntry.objects.create(word='el', meaning='Existing', source='Book', published=True)
        response = self.client.post(self.url, {'file': excel([
            ['word', 'meaning', 'source', 'tr'],
            ['el', 'Do not overwrite', 'Book', 'el'],
            ['bodun', 'Xalq', 'Book', 'halk'],
            ['bodun', 'Xalq', 'Book', 'halk'],
        ])})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['skipped'], 2)
        self.assertEqual(WordEntry.objects.count(), 1)
        token = response.context['token']
        response = self.client.post(self.url, {'token': token})
        self.assertEqual(response.status_code, 302)
        entry = WordEntry.objects.get(word='bodun')
        self.assertFalse(entry.published)
        self.assertIsNone(entry.reviewed_at)
        self.assertEqual(entry.equivalents, {'tr': 'halk'})
        self.assertEqual(WordEntry.objects.get(word='el').meaning, 'Existing')
        self.client.post(self.url, {'token': token})
        self.assertEqual(WordEntry.objects.count(), 2)

    def test_invalid_row_prevents_entire_preview(self):
        response = self.client.post(self.url, {'file': excel([
            ['word', 'meaning', 'source'], ['el', 'Xalq', 'Book'], ['bad', '', 'Book'],
        ])})
        self.assertIn('3-qator', response.context['errors'][0])
        self.assertNotIn('token', response.context)
        self.assertFalse(WordEntry.objects.exists())

    def test_formulas_corrupt_files_and_headers_rejected(self):
        for upload in [excel([['word', 'meaning', 'source'], ['=1+1', 'Test', 'Book']]),
                       excel([['word', 'word', 'source']]),
                       SimpleUploadedFile('words.xlsx', b'not an excel file')]:
            with self.assertRaises(ValidationError):
                parse_workbook(upload)

    def test_permissions_and_signature(self):
        response = self.client.post(self.url, {'token': 'tampered'})
        self.assertTrue(response.context['errors'])
        staff = get_user_model().objects.create_user('staff', is_staff=True)
        self.client.force_login(staff)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertEqual(self.client.get(reverse('admin:korpus_wordentry_template')).status_code, 403)

    def test_template_download(self):
        response = self.client.get(reverse('admin:korpus_wordentry_template'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content.startswith(b'PK'))


class WordAudioTests(TestCase):
    def test_public_sample_demo_is_labeled_and_does_not_claim_review(self):
        from .demo_audio import SAMPLE_SOURCE
        entry = WordEntry(word='bilim', meaning='Sample', source=SAMPLE_SOURCE)
        result = WordSerializer(entry).data
        self.assertTrue(result['audio'].endswith('/korpus/audio/demo/bilim.mp3'))
        self.assertTrue(result['audio_demo'])
        self.assertFalse(result['reviewed'])
        entry.pronunciation = 'A different scholarly reading'
        self.assertIsNone(WordSerializer(entry).data['audio'])

    def test_unapproved_audio_not_exposed(self):
        entry = WordEntry(word='el', meaning='Xalq', source='Book', audio='pronunciations/el.mp3',
                          audio_credit='Researcher, permission granted', audio_kind='ai')
        self.assertIsNone(WordSerializer(entry).data['audio'])
        self.assertIsNone(WordSerializer(entry).data['audio_kind'])
        entry.audio_approved = True
        self.assertTrue(WordSerializer(entry).data['audio'].endswith('el.mp3'))
        self.assertEqual(WordSerializer(entry).data['audio_kind'], 'ai')

    def test_approval_requires_audio_and_credit(self):
        entry = WordEntry(word='el', meaning='Xalq', source='Book', audio_approved=True)
        with self.assertRaises(ValidationError):
            entry.full_clean()

    @override_settings(DEBUG=True)
    def test_upload_then_review_and_replacement_resets_review(self):
        with TemporaryDirectory() as directory, override_settings(MEDIA_ROOT=directory):
            data = {'word': 'el', 'meaning': 'Xalq', 'source': 'Book', 'status': 'historical',
                    'audio_kind': 'human', 'audio_credit': 'Researcher, permission granted', 'audio_approved': True}
            form = WordAdminForm(data=data, files={'audio': SimpleUploadedFile('el.mp3', b'ID3test')})
            self.assertTrue(form.is_valid(), form.errors)
            entry = form.save()
            self.assertFalse(entry.audio_approved)
            form = WordAdminForm(data=data, instance=entry)
            self.assertTrue(form.is_valid(), form.errors)
            entry = form.save()
            self.assertTrue(entry.audio_approved)
            form = WordAdminForm(data=data, instance=entry,
                                 files={'audio': SimpleUploadedFile('new.mp3', b'ID3new')})
            self.assertTrue(form.is_valid(), form.errors)
            self.assertFalse(form.save().audio_approved)

    @override_settings(DEBUG=True)
    def test_invalid_audio_extension_rejected(self):
        form = WordAdminForm(data={'word': 'el', 'meaning': 'Xalq', 'source': 'Book',
                                   'status': 'historical', 'audio_kind': 'human'},
                             files={'audio': SimpleUploadedFile('bad.html', b'<html>')})
        self.assertFalse(form.is_valid())
        self.assertIn('audio', form.errors)
