"""Verify the publication switches used in Django admin reach the reader APIs."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Monument, MonumentLine, WordEntry


class AdminPublicationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(get_user_model().objects.create_user('publication-reader'))
        self.monument = Monument.objects.create(title='Admin publication smoke record', year=701,
            location='Test location', script='koktürk', category='bitiglar', status='Qoralama',
            description='Temporary record to verify the admin publication workflow.')
        self.line = MonumentLine.objects.create(monument=self.monument, position=987,
            label='QA-987', transliteration='adminpublishedline', translation='Temporary published line',
            source='Test edition, p. 1', published=True)
        self.draft_line = MonumentLine.objects.create(monument=self.monument, position=988,
            label='QA-DRAFT', transliteration='admindraftline', translation='Must remain hidden',
            source='Test edition, p. 1', published=False)
        self.word = WordEntry.objects.create(word='adminpublicationword', meaning='Temporary test definition',
            source='Test dictionary source', monument=self.monument, published=False)

    def tearDown(self):
        self.monument.delete()
        self.word.delete()

    def test_admin_published_monument_and_lines_appear_but_drafts_do_not(self):
        hidden = self.client.get('/api/v2/monuments/', {'scope': 'core', 'search': self.monument.title})
        self.assertEqual(hidden.status_code, 200)
        self.assertEqual(hidden.data['count'], 0)

        # Same model fields edited by the Monument admin publication control.
        Monument.objects.filter(pk=self.monument.pk).update(status='Chop etilgan')
        listed = self.client.get('/api/v2/monuments/', {'scope': 'core', 'search': self.monument.title})
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data['count'], 1)
        detail = self.client.get(f'/api/v2/monuments/{self.monument.pk}/', {'noview': 1})
        self.assertEqual(detail.status_code, 200)
        self.assertEqual([row['label'] for row in detail.data['reading']['lines']], ['QA-987'])
        self.assertNotIn('admindraftline', detail.data['transliteration'])

    def test_admin_published_dictionary_entry_appears_in_list_and_lookup(self):
        hidden = self.client.get('/api/v2/words/', {'scope': 'core', 'search': 'adminpublicationword'})
        self.assertEqual(hidden.data['count'], 0)
        WordEntry.objects.filter(pk=self.word.pk).update(published=True)
        # A dictionary entry linked to a draft monument stays outside the
        # public core until its parent monument is published as well.
        still_hidden = self.client.get('/api/v2/words/', {'scope': 'core', 'search': 'adminpublicationword'})
        self.assertEqual(still_hidden.data['count'], 0)
        Monument.objects.filter(pk=self.monument.pk).update(status='Chop etilgan')
        listed = self.client.get('/api/v2/words/', {'scope': 'core', 'search': 'adminpublicationword'})
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data['count'], 1)
        lookup = self.client.get('/api/v2/words/lookup/', {'q': 'adminpublicationword', 'scope': 'core'})
        self.assertEqual(lookup.status_code, 200)
        self.assertEqual(lookup.data['results'][0]['word'], 'adminpublicationword')
