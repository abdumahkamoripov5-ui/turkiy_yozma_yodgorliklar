import csv
import io
import xml.etree.ElementTree as ET
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from openpyxl import load_workbook
from rest_framework.test import APIClient

from .models import Monument, MonumentLine, ReadingVariant, ResearchItem, WordEntry, WordForm


@override_settings(FRONTEND_URL='/app/', REST_FRAMEWORK={
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_PAGINATION_CLASS': 'korpus.pagination.StandardPagination',
    'DEFAULT_THROTTLE_RATES': {'search': '10000/min', 'export': '10000/min'},
})
class ResearchTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = get_user_model().objects.create_user('researcher')
        self.other = get_user_model().objects.create_user('other')
        self.editor = get_user_model().objects.create_user('editor', is_staff=True)
        self.api = APIClient()
        self.api.force_authenticate(self.user)
        self.monument = Monument.objects.create(title='Kultegin fixture', year=732, location='Orkhon',
            script='koktürk', category='bitiglar', language='Old Turkic', description='Fixture',
            transliteration='BİLGÄ el o‘g‘il el\nbodun el\nNext text',
            bibliography=['Edition A, p. 12'])
        self.second = Monument.objects.create(title='Other fixture', year=900, year_end=950,
            location='Turfan', script="uyg'ur", category='diniy', description='Fixture',
            transliteration='bilgäler bodun')
        self.draft = Monument.objects.create(title='Private title', year=732, location='Orkhon',
            script='koktürk', category='bitiglar', description='Private', status='Qoralama',
            transliteration='private el')

    def get(self, path, params=None):
        return self.api.get('/api/v2/' + path, params or {})

    def search(self, **params):
        return self.get('research/search/', {'q': 'el', 'field': 'transliteration', **params})

    def test_every_research_and_workspace_endpoint_requires_membership(self):
        self.api.force_authenticate(None)
        for path in ['research/search/?q=el', 'research/frequency/', 'research/collocations/?q=el',
                     'research/options/', 'research/morphology/?q=el', 'research/variants/?monument=1',
                     'research/export/', 'workspace/items/', 'workspace/export/']:
            self.assertEqual(self.get(path).status_code, 401, path)

    def test_word_boundaries_and_unicode_offsets_preserve_original_match(self):
        self.assertEqual(self.search().data['count'], 3)
        found = self.search(q='BI\u0307LGA\u0308').data['results'][0]
        self.assertEqual(found['match'], 'BİLGÄ')
        self.assertEqual(found['left'], '')
        self.assertTrue(found['right'].startswith(' el'))
        self.assertEqual(self.search(q="O'G'IL").data['results'][0]['match'], 'o‘g‘il')
        self.assertEqual(self.search(q="o'g'il", normalize='0').data['count'], 0)
        self.assertEqual(self.search(q='EL', case_sensitive='1').data['count'], 0)
        self.assertGreater(self.search(q='bod', mode='substring').data['count'], self.search(q='bod').data['count'])
        self.assertEqual(self.search(q="g'il").data['count'], 0)

    def test_filters_compose_and_periods_overlap(self):
        data = self.search(q='bodun', script="uyg'ur", location='Turfan', year_min=940, year_max=960).data
        self.assertEqual([row['monumentId'] for row in data['results']], [self.second.pk])
        self.assertEqual(self.search(monuments=str(self.second.pk)).data['count'], 0)
        self.assertEqual(self.search(language='Old Turkic').data['document_count'], 1)
        self.assertEqual(self.search(source='Edition A').data['count'], 3)
        for params in [{'year_min': 800, 'year_max': 700}, {'page': 'oops'}, {'mode': 'regex'},
                       {'field': 'password'}, {'monuments': '1,NaN'}, {'context': 5000}, {'q': ''}]:
            self.assertEqual(self.search(**params).status_code, 400, params)

    def test_pagination_counts_and_drafts_do_not_leak(self):
        data = self.search(page_size=1, page=2).data
        self.assertEqual(data['count'], 3)
        self.assertEqual(len(data['results']), 1)
        self.assertFalse(data['truncated'])
        self.assertNotIn('Private title', str(data))
        self.assertEqual(self.search(monuments=str(self.draft.pk)).data['document_count'], 0)
        self.assertNotIn('Private title', str(self.get('research/options/').data))

    def test_editorial_lines_and_source_links_are_authoritative(self):
        MonumentLine.objects.create(monument=self.monument, position=1, transliteration='secret el', source='Secret source')
        line = MonumentLine.objects.create(monument=self.monument, position=2, label='E 2',
            original='Runes', transliteration='el bodun', translation='people', source='Reviewed edition, p. 9', published=True)
        result = self.search(monuments=str(self.monument.pk)).data
        self.assertEqual(result['count'], 1)
        row = result['results'][0]
        self.assertEqual(row['alignment'], 'editorial')
        self.assertTrue(row['target'].endswith('#line-2'))
        self.assertIn('/app/monuments?monument=', row['citation'])
        self.assertIn(line.source, row['citation'])
        self.assertEqual(self.search(source='Secret source').data['document_count'], 0)

    def test_unaligned_results_do_not_claim_parallel_lines(self):
        row = self.search().data['results'][0]
        self.assertEqual(row['alignment'], 'unavailable')
        self.assertNotIn('#line-', row['target'])

    def test_lemma_expansion_uses_only_reviewed_published_forms(self):
        WordForm.objects.create(form='bilgäler', lemma='bilgä', source='Grammar', reviewed=True,
                                published=True, reviewed_by=self.editor)
        WordForm.objects.create(form='el', lemma='bilgä', source='Draft', reviewed=False, published=False)
        response = self.search(q='bilgä', mode='lemma').data
        self.assertEqual(response['count'], 1)
        self.assertEqual(response['analysis_count'], 1)
        self.assertEqual(response['results'][0]['match'], 'bilgäler')
        self.assertEqual(self.get('research/morphology/', {'q': 'el'}).data['results'], [])
        self.assertEqual(self.get('research/morphology/', {'q': 'bilgäler'}).data['results'][0]['lemma'], 'bilgä')

    def test_short_words_are_counted_and_rates_use_full_selected_corpus(self):
        data = self.get('research/frequency/', {'monuments': self.monument.pk, 'q': 'el'}).data
        self.assertEqual(data['total_tokens'], 8)
        self.assertEqual(data['results'], [{'word': 'el', 'count': 3, 'documents': 1, 'per_10000': 3750.0}])
        self.assertEqual(data['documents'][0]['matches'], 3)
        self.assertEqual(data['document_count'], 1)
        self.assertEqual(self.get('research/frequency/', {'monuments': self.draft.pk}).data['total_tokens'], 0)

    def test_collocations_do_not_cross_line_boundaries(self):
        data = self.get('research/collocations/', {'q': 'el', 'field': 'transliteration', 'window': 1,
                                                  'monuments': self.monument.pk}).data
        self.assertEqual(data['target_occurrences'], 3)
        rows = {row['word']: row for row in data['results']}
        self.assertNotIn('next', rows)
        self.assertEqual(rows['bodun']['left'], 1)
        self.assertEqual(rows['bodun']['right'], 0)
        self.assertEqual(rows['bodun']['documents'], 1)

    def test_filtered_exports_are_usable_and_escape_spreadsheet_formulas(self):
        self.monument.title = '=dangerous'
        self.monument.save()
        response = self.search(monuments=str(self.monument.pk), download='csv')
        rows = list(csv.reader(io.StringIO(response.content.decode('utf-8-sig'))))
        self.assertEqual(rows[1][0], "'=dangerous")
        self.assertEqual(len(rows), 4)
        response = self.search(monuments=str(self.monument.pk), download='xlsx')
        sheet = load_workbook(io.BytesIO(response.content), data_only=False).active
        self.assertEqual(sheet['A2'].value, "'=dangerous")
        self.assertEqual(self.search(download='pdf').status_code, 400)

    def test_tei_contains_selected_text_and_reviewed_apparatus_only(self):
        line = MonumentLine.objects.create(monument=self.monument, position=1, transliteration='el',
            source='Edition', published=True, certainty='uncertain')
        ReadingVariant.objects.create(line=line, scholar='Scholar A', reading='il', source='Edition B p. 4',
                                     published=True, reviewed_by=self.editor)
        ReadingVariant.objects.create(line=line, scholar='Private scholar', reading='private', source='Draft')
        response = self.get('research/export/', {'monuments': self.monument.pk, 'download': 'tei'})
        self.assertEqual(response.status_code, 200)
        tree = ET.fromstring(response.content)
        ns = {'t': 'http://www.tei-c.org/ns/1.0'}
        self.assertEqual(len(tree.findall('t:TEI', ns)), 1)
        self.assertEqual(tree.find('.//t:rdg', ns).text, 'il')
        self.assertIsNotNone(tree.find('.//t:unclear', ns))
        self.assertNotIn(b'Private scholar', response.content)
        self.assertNotIn(b'Other fixture', response.content)

    def test_corpus_export_applies_search_to_selected_monuments(self):
        response = self.get('research/export/', {'q': 'bilgäler', 'download': 'json'})
        rows = response.json()
        self.assertEqual({row['monumentTitle'] for row in rows}, {self.second.title})

    def test_private_notebook_is_persistent_and_owner_scoped(self):
        payload = {'key': 'note-1', 'title': 'Research', 'kind': 'note', 'note': 'Only me',
                   'collection': 'Thesis', 'target': '/corpus?q=el', 'payload': {'source': 'Edition'}}
        response = self.api.put('/api/v2/workspace/items/by-key/', payload, format='json')
        self.assertEqual(response.status_code, 201)
        pk = response.data['id']
        payload['note'] = 'Updated'
        self.assertEqual(self.api.put('/api/v2/workspace/items/by-key/', payload, format='json').status_code, 200)
        self.assertEqual(ResearchItem.objects.filter(user=self.user).count(), 1)
        fresh = APIClient()
        fresh.force_authenticate(self.user)
        self.assertEqual(fresh.get('/api/v2/workspace/items/').data['results'][0]['note'], 'Updated')
        self.api.force_authenticate(self.other)
        self.assertEqual(self.get('workspace/items/').data['count'], 0)
        for method in ('get', 'patch', 'delete'):
            result = getattr(self.api, method)(f'/api/v2/workspace/items/{pk}/', {'note': 'Stolen'} if method == 'patch' else {})
            self.assertEqual(result.status_code, 404)
        self.assertEqual(self.get('workspace/export/', {'download': 'json'}).json(), [])
        self.api.delete('/api/v2/workspace/items/by-key/', {'key': 'note-1'}, format='json')
        self.assertTrue(ResearchItem.objects.filter(pk=pk).exists())

    def test_notebook_validates_links_shapes_and_immutable_keys(self):
        base = {'key': 'note-2', 'title': 'Note'}
        for invalid in [{'target': '//evil.example'}, {'target': 'https://evil.example'},
                        {'target': '/\\evil'}, {'payload': []}, {'payload': {'long': 'x' * 21000}},
                        {'note': 'x' * 10001}, {'key': '../bad'}, {'kind': 'admin'}]:
            response = self.api.put('/api/v2/workspace/items/by-key/', {**base, **invalid}, format='json')
            self.assertEqual(response.status_code, 400, invalid.keys())
        row = self.api.put('/api/v2/workspace/items/by-key/', base, format='json').data
        self.assertEqual(self.api.patch(f"/api/v2/workspace/items/{row['id']}/", {'key': 'changed'}, format='json').status_code, 400)

    def test_variants_hide_unreviewed_or_unpublished_material(self):
        line = MonumentLine.objects.create(monument=self.monument, position=1, transliteration='el', source='Edition', published=True)
        ReadingVariant.objects.create(line=line, scholar='Reviewed', reading='il', source='Edition', published=True, reviewed_by=self.editor)
        ReadingVariant.objects.create(line=line, scholar='Draft', reading='private', source='Draft')
        response = self.get('research/variants/', {'monument': self.monument.pk})
        self.assertEqual([row['scholar'] for row in response.data['results']], ['Reviewed'])
        self.assertEqual(self.get('research/variants/', {'monument': self.draft.pk}).status_code, 404)

    def test_facsimile_regions_and_publication_require_valid_editorial_data(self):
        line = MonumentLine(monument=self.monument, transliteration='el', source='Edition')
        for region in [{'x': 90, 'y': 0, 'width': 20, 'height': 10}, [], {'x': 'oops'}]:
            line.image_region = region
            if region:
                with self.assertRaises(ValidationError):
                    line.full_clean()
        line.image_region = {'x': 10, 'y': 20, 'width': 30, 'height': 10}
        line.full_clean()
        form = WordForm(form='el', lemma='el', source='Edition', published=True)
        with self.assertRaises(ValidationError):
            form.full_clean()

    def test_dictionary_lookup_and_occurrences_follow_reviewed_inflections(self):
        entry = WordEntry.objects.create(word='bilgä', meaning='Wise', source='Dictionary', published=True)
        WordForm.objects.create(word=entry, form='bilgäler', lemma='bilgä', source='Grammar',
                                reviewed=True, published=True, reviewed_by=self.editor)
        self.assertEqual([row['id'] for row in self.get('words/lookup/', {'q': 'bilgäler'}).data['results']], [entry.pk])
        self.assertEqual([row['id'] for row in self.get('words/', {'search': 'bilgäler'}).data['results']], [entry.pk])
        rows = self.get(f'words/{entry.pk}/occurrences/').data['results']
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['monument'], self.second.pk)
        self.assertNotIn('#line-', rows[0]['target'])

    def test_decomposed_characters_stay_one_word_in_frequency(self):
        self.monument.transliteration = 'BI\u0307LGA\u0308 el'
        self.monument.save()
        data = self.get('research/frequency/', {'monuments': self.monument.pk}).data
        self.assertEqual(data['total_tokens'], 2)
        self.assertEqual(len(data['results']), 2)
        self.assertEqual(self.search(q='BİLGÄ').data['results'][0]['match'], 'BI\u0307LGA\u0308')

    def test_search_limit_is_reported_and_corpus_export_does_not_hide_truncation(self):
        with patch('korpus.research.MAX_MATCHES', 2):
            result = self.search().data
            self.assertEqual(result['count'], 2)
            self.assertTrue(result['truncated'])
            response = self.get('research/export/', {'q': 'el', 'download': 'tei'})
            self.assertEqual(response.status_code, 400)

    def test_catalogue_search_is_respected_in_exports(self):
        response = self.get('research/export/', {'search': 'Other fixture', 'download': 'json'})
        self.assertEqual({row['monumentTitle'] for row in response.json()}, {self.second.title})
        response = self.get('monuments/', {'year_min': 940, 'year_max': 960})
        self.assertEqual([row['id'] for row in response.data['results']], [self.second.pk])

    def test_stats_counts_actual_published_transliteration(self):
        self.monument.word_count = 99999
        self.monument.save()
        data = self.get('monuments/stats/', {'monuments': self.monument.pk}).data
        self.assertEqual(data['totalWords'], 8)
        self.assertEqual(data['recordedTotalWords'], 99999)
        self.assertEqual(data['totalLines'], 3)

    def test_private_notebook_responses_cannot_be_cached_publicly(self):
        for path in ['workspace/items/', 'workspace/export/?download=json']:
            self.assertEqual(self.get(path)['Cache-Control'], 'private, no-store')

    def test_search_limits_are_per_member_not_shared_network(self):
        from django.test import RequestFactory
        from .throttling import SearchRateThrottle
        request = RequestFactory().get('/api/v2/research/search/?q=el')
        request.user = self.user
        throttle = SearchRateThrottle()
        first = throttle.get_cache_key(request, None)
        request.user = self.other
        self.assertNotEqual(first, throttle.get_cache_key(request, None))

    def test_editorial_quality_filter_accepts_only_published_line_sources(self):
        from django.contrib import admin
        from django.test import RequestFactory
        from .admin import EditorialQualityFilter
        self.second.bibliography = []
        self.second.save()
        line = MonumentLine.objects.create(monument=self.second, position=1, transliteration='x', source='Unreviewed')
        request = RequestFactory().get('/django-admin/korpus/monument/')
        quality = EditorialQualityFilter(request, {'editorial_quality': ['source']}, Monument, admin.site._registry[Monument])
        self.assertIn(self.second.pk, quality.queryset(request, Monument.objects.all()).values_list('pk', flat=True))
        line.published = True
        line.save()
        self.assertNotIn(self.second.pk, quality.queryset(request, Monument.objects.all()).values_list('pk', flat=True))
