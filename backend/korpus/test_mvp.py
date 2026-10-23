import tempfile
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files.storage import FileSystemStorage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Book, WordEntry, MediaLesson, WordPoll, PollOption, PollVote, ResearchWork


class MvpTests(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        self.user = get_user_model().objects.create_user('reader', password='a-safe-test-pass-9462')
        self.other = get_user_model().objects.create_user('other', password='other-safe-pass-9462')
        self.poll = WordPoll.objects.create(title='Tanlov', context='Sinov', published=True,
            starts_at=timezone.now() - timedelta(days=1), ends_at=timezone.now() + timedelta(days=1))
        self.option = PollOption.objects.create(poll=self.poll, word='Muqobil', explanation='Izoh')

    def test_only_published_books_and_no_page_content_in_list(self):
        public = Book.objects.create(title='Ochiq', author='Muallif', description='Izoh', published=True,
                                     pages=[{'title': 'Satr', 'text': 'Ochiq matn'}])
        hidden = Book.objects.create(title='Yashirin', author='Muallif', description='Izoh')
        response = self.api.get('/api/v2/books/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertNotIn('pages', response.data['results'][0])
        self.assertEqual(self.api.get(f'/api/v2/books/{hidden.pk}/').status_code, 404)
        self.assertEqual(self.api.get(f'/api/v2/books/{public.pk}/').data['pages'][0]['text'], 'Ochiq matn')

    def test_vote_requires_login_and_can_only_be_cast_once(self):
        url = f'/api/v2/polls/{self.poll.pk}/vote/'
        self.assertEqual(self.api.post(url, {'option': self.option.pk}, format='json').status_code, 401)
        self.api.force_authenticate(self.user)
        self.assertEqual(self.api.post(url, {'option': self.option.pk}, format='json').status_code, 201)
        self.assertEqual(self.api.post(url, {'option': self.option.pk}, format='json').status_code, 409)
        self.assertEqual(PollVote.objects.count(), 1)
        response = self.api.get(f'/api/v2/polls/{self.poll.pk}/')
        self.assertEqual(response.data['options'][0]['votes_count'], 1)
        self.assertEqual(response.data['my_vote'], self.option.pk)

    def test_foreign_option_and_closed_poll_rejected(self):
        self.api.force_authenticate(self.user)
        another = WordPoll.objects.create(title='Other', context='...', ends_at=timezone.now())
        option = PollOption.objects.create(poll=another, word='Other', explanation='...')
        url = f'/api/v2/polls/{self.poll.pk}/vote/'
        self.assertEqual(self.api.post(url, {'option': option.pk}, format='json').status_code, 404)
        self.poll.ends_at = timezone.now() - timedelta(seconds=1)
        self.poll.save()
        self.assertEqual(self.api.post(url, {'option': self.option.pk}, format='json').status_code, 400)
        self.assertFalse(PollVote.objects.exists())

    def test_winner_requires_closed_campaign_and_is_published_only_once(self):
        PollVote.objects.create(poll=self.poll, option=self.option, user=self.user)
        with self.assertRaises(ValidationError):
            self.poll.approve_winner(self.user)
        self.poll.ends_at = timezone.now() - timedelta(seconds=1)
        self.poll.save()
        entry = self.poll.approve_winner(self.user)
        self.assertEqual(entry.status, 'community')
        self.assertTrue(entry.published)
        with self.assertRaises(ValidationError):
            self.poll.approve_winner(self.user)
        self.assertEqual(WordEntry.objects.filter(campaign=self.poll).count(), 1)

    def test_tie_and_zero_votes_do_not_create_winner(self):
        self.poll.ends_at = timezone.now() - timedelta(seconds=1)
        self.poll.save()
        with self.assertRaises(ValidationError):
            self.poll.approve_winner(self.user)
        second = PollOption.objects.create(poll=self.poll, word='Ikkinchi', explanation='...')
        PollVote.objects.create(poll=self.poll, option=self.option, user=self.user)
        PollVote.objects.create(poll=self.poll, option=second, user=self.other)
        with self.assertRaises(ValidationError):
            self.poll.approve_winner(self.user)
        self.assertFalse(WordEntry.objects.exists())

    def test_quiz_answers_are_hidden_and_checked_on_server(self):
        lesson = MediaLesson.objects.create(title='Dars', description='...', audience='children', published=True,
            quiz={'question': 'Savol', 'options': ['a', 'b'], 'answer': 1, 'explanation': 'Izoh'})
        url = f'/api/v2/lessons/{lesson.pk}/'
        self.assertNotIn('answer', self.api.get(url).data['quiz'])
        response = self.api.post(url + 'answer/', {'answer': 0}, format='json')
        self.assertFalse(response.data['correct'])
        self.assertTrue(self.api.post(url + 'answer/', {'answer': 1}, format='json').data['correct'])
        self.assertEqual(self.api.post(url + 'answer/', {'answer': -1}, format='json').status_code, 400)

    def test_research_publication_cannot_be_set_by_submitter(self):
        self.api.force_authenticate(self.user)
        payload = {'title': 'Ish', 'author': 'Muallif', 'kind': 'article', 'abstract': 'Annotatsiya',
                   'status': 'approved', 'reviewer_note': 'Soxta izoh'}
        response = self.api.post('/api/v2/research/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        work = ResearchWork.objects.get()
        self.assertEqual(work.status, 'pending')
        self.assertEqual(work.reviewer_note, '')
        self.assertEqual(self.api.get('/api/v2/research/mine/').data['count'], 1)
        self.api.force_authenticate(self.other)
        self.assertEqual(self.api.get('/api/v2/research/mine/').data['count'], 0)
        self.api.force_authenticate(None)
        self.assertEqual(self.api.get('/api/v2/research/').data['count'], 0)

    def test_pending_document_is_private_but_owner_can_download(self):
        with tempfile.TemporaryDirectory() as directory:
            field = ResearchWork._meta.get_field('document')
            previous = field.storage
            field.storage = FileSystemStorage(location=directory)
            self.addCleanup(setattr, field, 'storage', previous)
            work = ResearchWork.objects.create(title='Ish', author='A', kind='article', abstract='...',
                submitted_by=self.user, document=SimpleUploadedFile('paper.pdf', b'%PDF-1.4\nhello'))
            url = f'/api/v2/research/{work.pk}/document/'
            self.assertEqual(self.api.get(url).status_code, 404)
            self.api.force_authenticate(self.other)
            self.assertEqual(self.api.get(url).status_code, 404)
            self.api.force_authenticate(self.user)
            response = self.api.get(url)
            self.assertEqual(response.status_code, 200)
            response.close()
            work.status = 'approved'; work.reviewer_note = 'Ichki izoh'; work.save()
            self.api.force_authenticate(None)
            response = self.api.get(url)
            self.assertEqual(response.status_code, 200)
            response.close()
            self.assertNotIn('reviewer_note', self.api.get('/api/v2/research/').data['results'][0])

    def test_invalid_pdf_is_rejected(self):
        self.api.force_authenticate(self.user)
        response = self.api.post('/api/v2/research/', {'title': 'Ish', 'author': 'A', 'kind': 'book',
            'abstract': '...', 'document': SimpleUploadedFile('fake.pdf', b'not a pdf')}, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_registration_creates_non_staff_account_and_tokens(self):
        response = self.api.post('/api/v2/auth/register/', {'username': 'newreader',
            'password': 'uNusual-safe-password-729', 'is_staff': True}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('access', response.data)
        self.assertFalse(get_user_model().objects.get(username='newreader').is_staff)
        self.assertEqual(self.api.post('/api/v2/auth/register/', {'username': 'weak', 'password': '123'}, format='json').status_code, 400)

    def test_admin_lists_and_content_forms_render(self):
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.client.force_login(self.user)
        for model in ['book', 'medialesson', 'wordpoll', 'researchwork', 'wordentry', 'sourcelink']:
            with self.subTest(model=model):
                self.assertEqual(self.client.get(f'/django-admin/korpus/{model}/').status_code, 200)
                self.assertEqual(self.client.get(f'/django-admin/korpus/{model}/add/').status_code, 200)

    def test_release_health_reports_readiness(self):
        response = self.api.get('/api/v2/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'ok')
        self.assertTrue(response.data['mvp'])
        self.assertIn('release', response.data)

    def test_spa_policy_allows_videos_from_external_media_storage(self):
        from django.conf import settings
        self.assertIn("media-src 'self' https: blob:;", settings.CONTENT_SECURITY_POLICY)

    @override_settings(DEBUG=False, PRIVATE_AWS_STORAGE_BUCKET_NAME='', PRIVATE_UPLOADS_PERSISTENT=False)
    def test_production_pdf_requires_persistent_private_storage(self):
        self.api.force_authenticate(self.user)
        response = self.api.post('/api/v2/research/', {'title': 'Ish', 'author': 'A', 'kind': 'book',
            'abstract': '...', 'document': SimpleUploadedFile('paper.pdf', b'%PDF-1.4\nhello')}, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('doimiy', str(response.data))

    @override_settings(DEBUG=False, AWS_STORAGE_BUCKET_NAME='', MEDIA_UPLOADS_PERSISTENT=False)
    def test_production_video_requires_persistent_media_storage(self):
        lesson = MediaLesson(title='Video', description='...', audience='children',
                            video=SimpleUploadedFile('video.webm', b'fixture'))
        with self.assertRaises(ValidationError):
            lesson.clean()
