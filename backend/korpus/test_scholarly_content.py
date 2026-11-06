import io,json
from unittest.mock import Mock
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.management import call_command
from django.core.management.base import CommandError
from django.core.exceptions import PermissionDenied
from django.test import TestCase, RequestFactory
from rest_framework.test import APIClient
from .models import Monument, MonumentLine, WordEntry
from .mvp_admin import WordAdmin
from .admin import MonumentLineAdmin
from .scientific_review import approve_scientific_content


class ScholarlyContentTests(TestCase):
    def setUp(self):
        self.user=get_user_model().objects.create_user('edition-reader')
        self.api=APIClient();self.api.force_authenticate(self.user)

    def install(self, *args):
        call_command('seed_scholarly_corpus', *args, stdout=io.StringIO())

    def request(self, permission=None):
        user=get_user_model().objects.create_user('editor',is_staff=True)
        if permission:user.user_permissions.add(Permission.objects.get(codename=permission))
        request=RequestFactory().post('/django-admin/')
        request.user=user
        return request

    def test_dry_run_makes_no_database_changes(self):
        self.install('--dry-run')
        self.assertFalse(Monument.objects.exists())
        self.assertFalse(WordEntry.objects.exists())

    def test_package_installs_source_backed_content_without_fabricating_experts(self):
        self.install()
        self.assertEqual(MonumentLine.objects.count(),11)
        self.assertEqual(WordEntry.objects.filter(published=True).count(),37)
        self.assertFalse(MonumentLine.objects.exclude(reviewed_by=None).exists())
        self.assertFalse(WordEntry.objects.exclude(reviewed_by=None).exists())
        for line in MonumentLine.objects.all():
            self.assertTrue(line.source)
            self.assertTrue(line.provenance['pages'])
            self.assertEqual(line.provenance['translation_status'],'working')
            self.assertIn('source_translation',line.provenance)
        self.assertEqual(MonumentLine.objects.exclude(original='').count(),3)

    def test_import_is_idempotent_and_preserves_editorial_changes(self):
        self.install()
        line=MonumentLine.objects.first();line.editorial_note='Human correction';line.save()
        word=WordEntry.objects.first();word.meaning='Human revised definition';word.save()
        self.install()
        self.assertEqual(MonumentLine.objects.count(),11)
        self.assertEqual(WordEntry.objects.count(),37)
        line.refresh_from_db();word.refresh_from_db()
        self.assertEqual(line.editorial_note,'Human correction')
        self.assertEqual(word.meaning,'Human revised definition')

    def test_collision_rolls_back_import(self):
        m=Monument.objects.create(title='Kültigin bitigi',year=732,location='Orkhon',script='koktürk',category='bitiglar')
        existing=MonumentLine.objects.create(monument=m,position=1,transliteration='Human text')
        with self.assertRaises(CommandError):self.install()
        self.assertEqual(MonumentLine.objects.count(),1)
        self.assertEqual(Monument.objects.count(),1)
        existing.refresh_from_db();self.assertEqual(existing.transliteration,'Human text')

    def test_attested_form_lookup_and_occurrences_link_to_real_source_passage(self):
        self.install()
        lookup=self.api.get('/api/v2/words/lookup/',{'q':'qapıγqa','scope':'core'}).data
        self.assertEqual([row['word']for row in lookup['results']],['qapıγ'])
        word=WordEntry.objects.get(word='qapıγ')
        rows=self.api.get(f'/api/v2/words/{word.pk}/occurrences/',{'scope':'core'}).data['results']
        self.assertTrue(rows)
        self.assertTrue(any(row['label']=='KT E2'for row in rows))

    def test_exports_preserve_rights_and_working_translation_status(self):
        self.install()
        response=self.api.get('/api/v2/research/export/',{'scope':'core','download':'json'})
        data=json.loads(response.content)
        self.assertEqual(len(data),11)
        self.assertTrue(all(row['provenance']['translation_status']=='working'for row in data))
        self.assertTrue(all(not row['expert_reviewed']for row in data))
        tei=self.api.get('/api/v2/research/export/',{'scope':'core','download':'tei'}).content.decode()
        self.assertIn('not_expert_reviewed',tei)
        self.assertIn('CC-BY-SA-4.0',tei)
        self.assertIn('source_translation',tei)

    def test_live_quality_distinguishes_source_preparation_from_review(self):
        self.install()
        data=self.api.get('/api/v2/research/quality/').data
        self.assertEqual(data['source_prepared_lines'],11)
        self.assertEqual(data['source_prepared_words'],37)
        self.assertEqual(data['expert_reviewed_lines'],0)
        self.assertEqual(data['reviewed_words'],0)

    def test_publishing_a_word_does_not_automatically_certify_it(self):
        word=WordEntry(word='test',source='Edition',meaning='Test',published=True)
        instance=WordAdmin(WordEntry,admin.site)
        instance.save_model(self.request(),word,Mock(changed_data=[]),False)
        self.assertIsNone(word.reviewed_by)
        self.assertIsNone(word.reviewed_at)

    def test_editor_without_scientific_permission_cannot_approve(self):
        self.install()
        instance=WordAdmin(WordEntry,admin.site);instance.message_user=Mock()
        with self.assertRaises(PermissionDenied):
            approve_scientific_content(instance,self.request(),WordEntry.objects.all())
        self.assertFalse(WordEntry.objects.exclude(reviewed_by=None).exists())

    def test_authorised_reviewer_is_recorded_and_content_edit_revokes_approval(self):
        self.install()
        instance=WordAdmin(WordEntry,admin.site);instance.message_user=Mock()
        request=self.request('review_wordentry')
        word=WordEntry.objects.first()
        approve_scientific_content(instance,request,WordEntry.objects.filter(pk=word.pk))
        word.refresh_from_db();self.assertEqual(word.reviewed_by,request.user)
        word.meaning='Changed';word.save();self.assertIsNone(word.reviewed_by)
        self.assertIsNone(word.reviewed_at)

    def test_line_reviewer_is_recorded_and_translation_edit_revokes_approval(self):
        self.install()
        instance=MonumentLineAdmin(MonumentLine,admin.site);instance.message_user=Mock()
        request=self.request('review_monumentline')
        line=MonumentLine.objects.first()
        approve_scientific_content(instance,request,MonumentLine.objects.filter(pk=line.pk))
        line.refresh_from_db();self.assertEqual(line.reviewed_by,request.user)
        line.translation='Changed translation';line.save(update_fields=['translation'])
        line.refresh_from_db();self.assertIsNone(line.reviewed_by)
        self.assertIsNone(line.reviewed_at)
