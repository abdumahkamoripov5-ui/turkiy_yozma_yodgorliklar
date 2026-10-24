from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Monument, MonumentLine, WordEntry


class ParallelReadingTests(TestCase):
    def setUp(self):
        cache.clear()
        self.api = APIClient()
        self.api.force_authenticate(get_user_model().objects.create_user('reader'))
        self.monument = Monument.objects.create(
            title='Reading fixture', year=732, location='Test', script='koktürk', category='bitiglar',
            description='Test', full_text='original one\noriginal two',
            transliteration='Bilgä bodun\nTengri', translation='Dono xalq\nOsmon')

    def detail(self):
        return self.api.get(f'/api/v2/monuments/{self.monument.pk}/?noview=1')

    def test_automatic_alignment_is_explicitly_unreviewed(self):
        reading = self.detail().data['reading']
        self.assertEqual(reading['alignment'], 'automatic')
        self.assertEqual(len(reading['lines']), 2)
        self.assertEqual(reading['lines'][1]['transliteration'], 'Tengri')
        self.assertIsNone(reading['lines'][0]['id'])

    def test_unequal_or_missing_columns_are_never_zipped(self):
        for value in ['', 'Only one line']:
            self.monument.translation = value
            self.monument.save()
            self.assertEqual(self.detail().data['reading'], {'alignment': 'unavailable', 'lines': []})

    def test_editorial_lines_override_automatic_but_hide_drafts(self):
        MonumentLine.objects.create(monument=self.monument, position=1, original='Private draft')
        public = MonumentLine.objects.create(monument=self.monument, position=2, label='E 1',
            transliteration='Bilgä', translation='Dono', source='Edition, p. 12', published=True)
        reading = self.detail().data['reading']
        self.assertEqual(reading['alignment'], 'editorial')
        self.assertEqual([line['id'] for line in reading['lines']], [public.pk])
        self.assertEqual(reading['lines'][0]['source'], 'Edition, p. 12')

    def test_published_lines_require_a_source_and_content(self):
        line = MonumentLine(monument=self.monument, transliteration='Text', published=True)
        with self.assertRaises(ValidationError):
            line.full_clean()
        line.source = 'Edition, p. 12'
        line.full_clean()
        line.transliteration = ''
        with self.assertRaises(ValidationError):
            line.full_clean()

    def test_public_api_cannot_write_editorial_lines(self):
        self.api.force_authenticate(None)
        response = self.api.patch(f'/api/v2/monuments/{self.monument.pk}/',
            {'reading': {'lines': []}}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_unpublished_monument_cannot_expose_reading(self):
        self.monument.status = 'Qoralama'
        self.monument.save()
        self.assertEqual(self.detail().status_code, 404)

    def test_word_lookup_normalizes_unicode_case_and_apostrophes(self):
        entry = WordEntry.objects.create(word='BİLGÄ', meaning='Dono', source='Dictionary', published=True)
        response = self.api.get('/api/v2/words/lookup/', {'q': 'BI\u0307LGA\u0308'})
        self.assertEqual([row['id'] for row in response.data['results']], [entry.pk])
        word = WordEntry.objects.create(word='o‘g‘il', meaning='Farzand', source='Dictionary', published=True)
        response = self.api.get('/api/v2/words/lookup/', {'q': "O'G'IL"})
        self.assertEqual([row['id'] for row in response.data['results']], [word.pk])

    def test_lookup_is_exact_and_never_exposes_unpublished_entries(self):
        WordEntry.objects.create(word='bodun', meaning='Private', source='Draft', published=False)
        WordEntry.objects.create(word='bodunlar', meaning='Not exact', source='Dictionary', published=True)
        response = self.api.get('/api/v2/words/lookup/', {'q': 'bodun'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'], [])
        for query in ['', 'a' * 101]:
            self.assertEqual(self.api.get('/api/v2/words/lookup/', {'q': query}).status_code, 400)
