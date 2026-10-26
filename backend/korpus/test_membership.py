from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Monument, MonumentLine, WordEntry, UserActivity, LoginActivity


class MembershipTests(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        self.user = get_user_model().objects.create_user('member', password='a-strong-password-7842')

    def test_anonymous_cannot_bypass_frontend_gate(self):
        for path in ['monuments/', 'monuments/featured/', 'words/', 'words/lookup/?q=el',
                     'monuments/stats/', 'monuments/concordance/?q=el',
                     'polls/', 'sources/', 'export/?format=json']:
            self.assertEqual(self.api.get('/api/v2/' + path).status_code, 401, path)
        self.assertEqual(self.api.post('/api/v2/submit/', {}).status_code, 401)

    def test_all_content_requires_membership_even_with_queries_or_ids(self):
        monuments = []
        words = []
        for index in range(6):
            monuments.append(Monument.objects.create(title=f'Monument {index}', year=700 + index,
                location='Test', script='koktürk', category='bitiglar', description='Test',
                status='Chop etilgan'))
            words.append(WordEntry.objects.create(word=f'word{index}', meaning='Test',
                                                   source='Edition', published=True))
        for resource in ['monuments', 'words']:
            response = self.api.get(f'/api/v2/{resource}/?page_size=200&ordering=-id&include_drafts=1')
            self.assertEqual(response.status_code, 401)
        for path in ['monuments/featured/', f'monuments/{monuments[0].pk}/',
                     f'monuments/{monuments[-1].pk}/', f'words/{words[-1].pk}/',
                     'words/lookup/?q=word5', 'monuments/?search=Monument%205']:
            self.assertEqual(self.api.get('/api/v2/' + path).status_code, 401, path)
        self.api.force_authenticate(self.user)
        self.assertEqual(self.api.get('/api/v2/monuments/').data['count'], 6)
        self.assertEqual(self.api.get('/api/v2/words/').data['count'], 6)
        self.assertEqual(self.api.get(f'/api/v2/monuments/{monuments[-1].pk}/').status_code, 200)
        self.assertEqual(self.api.get(f'/api/v2/words/{words[-1].pk}/').status_code, 200)
        self.assertEqual(len(self.api.get('/api/v2/words/lookup/?q=word5').data['results']), 1)

    def test_public_occurrences_do_not_reveal_members_only_monuments(self):
        monuments = [Monument.objects.create(title=f'Monument {index}', year=700 + index,
                    location='Test', script='koktürk', category='bitiglar', description='Test',
                    status='Chop etilgan') for index in range(4)]
        for monument in monuments:
            MonumentLine.objects.create(monument=monument, position=1, transliteration='el',
                                        source='Edition', published=True)
        word = WordEntry.objects.create(word='el', meaning='People', source='Edition', published=True)
        url = f'/api/v2/words/{word.pk}/occurrences/'
        self.assertEqual(self.api.get(url).status_code, 401)
        self.api.force_authenticate(self.user)
        self.assertEqual(len(self.api.get(url).data['results']), 4)

    def test_phase_two_endpoints_are_not_exposed(self):
        self.api.force_authenticate(self.user)
        for name in ['books', 'lessons', 'research']:
            self.assertEqual(self.api.get(f'/api/v2/{name}/').status_code, 404)

    def test_registration_unlocks_content_and_records_usage_without_query(self):
        response = self.api.post('/api/v2/auth/register/', {
            'username': 'new-member', 'password': 'strong-random-pass-4829'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data['is_staff'])
        self.assertTrue(LoginActivity.objects.filter(username='new-member', event='login').exists())
        self.api.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
        response = self.api.get('/api/v2/monuments/?search=private-query')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Cache-Control'], 'private, no-store')
        activity = UserActivity.objects.get(user__username='new-member')
        self.assertEqual(activity.path, '/api/v2/monuments/')
        self.assertNotIn('private-query', activity.path)

    def test_word_occurrences_hide_drafts_and_match_whole_words(self):
        self.api.force_authenticate(self.user)
        monument = Monument.objects.create(title='Test', year=732, location='Test', script='koktürk',
                                           category='bitiglar', description='Test', status='Chop etilgan')
        for index, text in enumerate(['el', 'eller', 'El'], 1):
            MonumentLine.objects.create(monument=monument, position=index, transliteration=text,
                                       source='Edition', published=index != 3)
        word = WordEntry.objects.create(word='el', meaning='People', source='Edition', published=True,
                                        pronunciation='el', equivalents={'uz': 'el'})
        response = self.api.get(f'/api/v2/words/{word.pk}/occurrences/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([line['position'] for line in response.data['results']], [1])
        word.equivalents = ['invalid']
        with self.assertRaises(ValidationError):
            word.full_clean()
