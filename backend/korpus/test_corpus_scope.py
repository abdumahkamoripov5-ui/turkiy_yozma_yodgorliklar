import io
import json
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Monument, MonumentLine, WordEntry
from .corpus_scope import core_monuments, monument_quality


class CoreCorpusTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = get_user_model().objects.create_user('corpus-reader')
        self.api = APIClient()
        self.api.force_authenticate(self.user)
        self.core = self.make_monument('Core', 732)
        self.later = self.make_monument('Later', 930)
        self.wide = self.make_monument('Wide range', 700, 900)
        self.make_monument('Invalid range', 750, 730)
        self.make_monument('Draft', 735, status='Qoralama')

    def make_monument(self, title, year, year_end=None, status='Chop etilgan'):
        return Monument.objects.create(title=title, year=year, year_end=year_end,
            location='Orkhon', script='koktürk', category='bitiglar', description='Test fixture',
            status=status, full_text='original', transliteration='bodun el', translation='people country',
            bibliography=['Test edition'])

    def get(self, path, **params):
        return self.api.get('/api/v2/' + path, {'scope': 'core', **params})

    def test_core_period_is_inclusive_and_rejects_broad_or_invalid_ranges(self):
        first = self.make_monument('Start boundary', 601)
        last = self.make_monument('End boundary', 800)
        self.make_monument('Too early', 600)
        self.assertEqual(set(core_monuments(Monument.objects.filter(status='Chop etilgan')).values_list('pk', flat=True)),
                         {self.core.pk, first.pk, last.pk})

    def test_catalogue_options_and_statistics_use_the_same_core(self):
        self.assertEqual(self.get('monuments/').data['count'], 1)
        self.assertEqual([row['id'] for row in self.get('research/options/').data['monuments']], [self.core.pk])
        self.assertEqual(self.get('monuments/stats/').data['total'], 1)
        self.assertEqual(self.get(f'monuments/{self.later.pk}/').status_code, 404)

    def test_search_and_both_exports_exclude_other_periods(self):
        data = self.get('research/search/', q='bodun').data
        self.assertEqual({row['monumentId'] for row in data['results']}, {self.core.pk})
        export = json.loads(self.get('research/export/', download='json').content)
        self.assertEqual({row['monumentTitle'] for row in export}, {'Core'})
        legacy = json.loads(self.get('export/', format='json').content)
        self.assertEqual([row['id'] for row in legacy['monuments']], [self.core.pk])

    def test_concordance_cache_cannot_mix_scopes(self):
        all_data = self.api.get('/api/v2/monuments/concordance/', {'q': 'bodun'}).data
        core_data = self.get('monuments/concordance/', q='bodun').data
        self.assertGreater(all_data['count'], core_data['count'])
        self.assertEqual(core_data['count'], 1)

    def test_quality_distinguishes_bibliography_from_editorial_alignment(self):
        quality = monument_quality(self.core)
        self.assertTrue(quality['has_bibliography'])
        self.assertEqual(quality['review_status'], 'needs_review')
        MonumentLine.objects.create(monument=self.core, position=1, original='original',
            transliteration='bodun', translation='people', source='Test edition, p. 1', published=True)
        quality = monument_quality(self.core)
        self.assertEqual(quality['complete_editorial_lines'], 1)
        report = self.get('research/quality/').data
        self.assertEqual(report['total'], 1)
        self.assertEqual(report['complete_editorial_lines'], 1)

    def test_reviewed_dictionary_filter_requires_both_reviewer_and_timestamp(self):
        WordEntry.objects.create(word='pending', meaning='Test', source='Edition', published=True,
                                 reviewed_at=timezone.now())
        reviewed = WordEntry.objects.create(word='reviewed', meaning='Test', source='Edition', published=True,
                                          reviewed_at=timezone.now(), reviewed_by=self.user)
        WordEntry.objects.create(word='late', meaning='Test', source='Edition', published=True, monument=self.later)
        response = self.get('words/', reviewed='1')
        self.assertEqual([row['id'] for row in response.data['results']], [reviewed.pk])
        self.assertEqual(self.get('words/', reviewed='0').data['count'], 1)

    def test_audit_does_not_modify_content_or_publication_state(self):
        before = list(Monument.objects.values('pk', 'title', 'status', 'full_text'))
        stream = io.StringIO()
        call_command('audit_corpus', '--json', stdout=stream)
        self.assertEqual(before, list(Monument.objects.values('pk', 'title', 'status', 'full_text')))
        report = json.loads(stream.getvalue())
        self.assertEqual(report['issue_counts']['outside_core_period'], 3)

    def test_quality_report_preserves_existing_access_policy(self):
        self.api.force_authenticate(None)
        self.assertEqual(self.get('research/quality/').status_code, 401)

    def test_line_import_is_dry_run_by_default_and_never_publishes(self):
        import csv
        import tempfile
        from pathlib import Path
        from .management.commands.import_corpus_lines import COLUMNS
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'lines.csv'
            with path.open('w', encoding='utf-8', newline='') as stream:
                writer = csv.writer(stream)
                writer.writerow(COLUMNS)
                writer.writerow([self.core.pk, 1, 'E 1', 'original', 'bodun', 'people', 'Fixture edition, p. 1'])
            call_command('import_corpus_lines', str(path), stdout=io.StringIO())
            self.assertFalse(MonumentLine.objects.exists())
            call_command('import_corpus_lines', str(path), '--apply', stdout=io.StringIO())
            self.assertFalse(MonumentLine.objects.get().published)
            from django.core.management.base import CommandError
            with self.assertRaises(CommandError):
                call_command('import_corpus_lines', str(path), '--apply', stdout=io.StringIO())
            self.assertEqual(MonumentLine.objects.count(), 1)

    def test_invalid_import_rolls_back_all_rows(self):
        import csv
        import tempfile
        from pathlib import Path
        from django.core.management.base import CommandError
        from .management.commands.import_corpus_lines import COLUMNS
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'lines.csv'
            with path.open('w', encoding='utf-8', newline='') as stream:
                writer = csv.writer(stream)
                writer.writerow(COLUMNS)
                writer.writerow([self.core.pk, 1, 'E 1', 'original', 'bodun', 'people', 'Fixture edition, p. 1'])
                writer.writerow([self.core.pk, 2, 'E 2', 'original', 'el', 'country', ''])
            with self.assertRaises(CommandError):
                call_command('import_corpus_lines', str(path), '--apply', stdout=io.StringIO())
            self.assertFalse(MonumentLine.objects.exists())

    def test_citations_use_configured_frontend_origin(self):
        from django.test import override_settings
        with override_settings(FRONTEND_URL='https://corpus.example.org/'):
            result = self.get('research/search/', q='bodun').data['results'][0]
            self.assertTrue(result['url'].startswith('https://corpus.example.org/monuments?'))
        with override_settings(FRONTEND_URL='/app/'):
            result = self.get('research/search/', q='bodun').data['results'][0]
            self.assertTrue(result['url'].startswith('http://testserver/app/monuments?'))
