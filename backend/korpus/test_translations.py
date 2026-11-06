from unittest.mock import Mock, patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import RequestFactory, TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .google_translation import TranslationNotConfigured, TranslationProviderError, generate_interface_translation_batch, translate_interface_texts
from .models import InterfaceTranslation


class TranslationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = get_user_model().objects.create_superuser('translator', email='translator@example.test', password='safe-test-password')
        self.client.force_authenticate(self.staff)

    def test_public_catalog_contains_only_published_translations(self):
        InterfaceTranslation.objects.create(key='nav_map', source_text='Xarita', language='kk', translated_text='Карта', status='published')
        InterfaceTranslation.objects.create(key='nav_words', source_text='Lug‘at', language='kk', translated_text='Сөздік', status='draft')
        response = self.client.get('/api/v2/translations/kk/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['translations'], {'nav_map': 'Карта'})

    def test_unsupported_catalog_language_returns_404(self):
        self.assertEqual(self.client.get('/api/v2/translations/xx/').status_code, 404)

    @patch('korpus.translation_api.generate_interface_translation_batch')
    def test_staff_translation_generation_returns_unpublished_drafts(self, generate):
        generate.return_value = ('batch-id', [
            {'language': 'tr', 'status': 'draft', 'id': 1, 'translation': 'Harita'},
            {'language': 'tg', 'status': 'draft', 'id': 2, 'translation': 'Харита'},
        ])
        response = self.client.post('/api/v2/translations/generate/', {
            'items': [{'key': 'Xarita', 'source_text': 'Xarita'}], 'target_languages': ['tr', 'tg'],
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual([row['status'] for row in response.data['results']], ['draft', 'draft'])
        generate.assert_called_once()

    @patch('korpus.translation_api.generate_interface_translation_batch', side_effect=TranslationNotConfigured())
    def test_missing_google_configuration_is_reported_without_exposing_credentials(self, generate):
        response = self.client.post('/api/v2/translations/generate/', {
            'items': [{'key': 'Xarita', 'source_text': 'Xarita'}], 'target_languages': ['tr'],
        }, format='json')
        self.assertEqual(response.status_code, 503)
        self.assertIn('sozlanmagan', response.data['detail'])
        generate.assert_called_once()

    def test_non_staff_cannot_generate_paid_translations(self):
        user = get_user_model().objects.create_user('reader', password='safe-test-password')
        self.client.force_authenticate(user)
        response = self.client.post('/api/v2/translations/generate/', {
            'items': [{'key': 'Xarita', 'source_text': 'Xarita'}], 'target_languages': ['tr'],
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_batch_rejects_duplicate_keys_and_excessive_source_text(self):
        duplicate = self.client.post('/api/v2/translations/generate/', {
            'items': [{'key': 'a', 'source_text': 'bir'}, {'key': 'a', 'source_text': 'ikki'}],
            'target_languages': ['tr'],
        }, format='json')
        too_large = self.client.post('/api/v2/translations/generate/', {
            'items': [{'key': 'a', 'source_text': 'x' * 2000}, {'key': 'b', 'source_text': 'y' * 2000}, {'key': 'c', 'source_text': 'z' * 1001}],
            'target_languages': ['tr'],
        }, format='json')
        self.assertEqual(duplicate.status_code, 400)
        self.assertEqual(too_large.status_code, 400)

    def test_public_catalog_does_not_require_google_credentials(self):
        response = self.client.get('/api/v2/translations/tr/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['translations'], {})
        self.assertEqual(self.client.get('/api/v2/translations/uz/').data['translations'], {})


class GoogleTranslationDraftTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser('editor', email='editor@example.test', password='safe-test-password')

    @patch('korpus.google_translation.translate_interface_texts', side_effect=[['Harita'], ['Карта']])
    def test_translation_batch_saves_each_locale_as_a_draft(self, translate):
        _, rows = generate_interface_translation_batch([{'key': 'Xarita', 'source_text': 'Xarita'}], ['tr', 'kk'], self.user)
        self.assertEqual([row['status'] for row in rows], ['draft', 'draft'])
        self.assertEqual(InterfaceTranslation.objects.filter(status='draft').count(), 2)
        self.assertEqual(translate.call_count, 2)

    @patch('korpus.google_translation.translate_interface_texts')
    def test_unchanged_source_skips_paid_google_request(self, translate):
        InterfaceTranslation.objects.create(key='Xarita', source_text='Xarita', language='tr', translated_text='Harita')
        _, rows = generate_interface_translation_batch([{'key': 'Xarita', 'source_text': 'Xarita'}], ['tr'], self.user)
        self.assertEqual(rows[0]['status'], 'unchanged')
        translate.assert_not_called()

    @patch('korpus.google_translation.translate_interface_texts', side_effect=[['Harita'], TranslationProviderError()])
    def test_failed_batch_does_not_save_partial_translations(self, translate):
        with self.assertRaises(TranslationProviderError):
            generate_interface_translation_batch([{'key': 'Xarita', 'source_text': 'Xarita'}], ['tr', 'kk'], self.user)
        self.assertFalse(InterfaceTranslation.objects.exists())

    @patch('korpus.google_translation._client_and_project')
    def test_provider_receives_plain_ui_text_with_language_codes(self, get_client):
        client = Mock()
        client.translate_text.return_value.translations = [Mock(translated_text='ZXQTMPL0QXZ ескерткіш'), Mock(translated_text='Өткөрүү')]
        client.translate_text.return_value.glossary_translations = []
        get_client.return_value = (client, 'unit-test-project', 'global')
        translated = translate_interface_texts(['{n} yodgorlik', 'O‘tkazish'], 'kk')
        self.assertEqual(translated, ['{n} ескерткіш', 'Өткөрүү'])
        request = client.translate_text.call_args.kwargs['request']
        self.assertEqual(request['source_language_code'], 'uz')
        self.assertEqual(request['target_language_code'], 'kk')
        self.assertEqual(request['contents'], ['ZXQTMPL0QXZ yodgorlik', 'O‘tkazish'])

    @patch('korpus.google_translation._client_and_project')
    def test_provider_rejects_a_translation_that_drops_a_format_placeholder(self, get_client):
        client = Mock()
        client.translate_text.return_value.translations = [Mock(translated_text='Ескерткіш')]
        get_client.return_value = (client, 'unit-test-project', 'global')
        with self.assertRaises(TranslationProviderError):
            translate_interface_texts(['{n} yodgorlik'], 'kk')


class TranslationAdminTests(TestCase):
    def test_google_draft_form_is_available_to_staff_and_shows_review_notice(self):
        user = get_user_model().objects.create_superuser('admin', email='admin@example.test', password='safe-test-password')
        self.client.force_login(user)
        response = self.client.get(reverse('admin:korpus_interfacetranslation_google_draft'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'qoralama')
        self.assertContains(response, 'Tojik tili')

    @patch('korpus.translation_admin.generate_interface_translation_batch')
    def test_translation_editor_can_send_a_bounded_multiline_batch(self, generate):
        user = get_user_model().objects.create_user('translator', password='safe-test-password', is_staff=True)
        user.user_permissions.add(*Permission.objects.filter(
            codename__in=['add_interfacetranslation', 'use_google_translation'],
            content_type__app_label='korpus',
        ))
        self.client.force_login(user)
        generate.return_value = ('batch', [
            {'key': 'nav_map', 'language': 'tr', 'status': 'draft'},
            {'key': 'nav_words', 'language': 'tr', 'status': 'draft'},
        ])
        response = self.client.post(reverse('admin:korpus_interfacetranslation_google_draft'), {
            'items': 'nav_map\tXarita\nnav_words\tLug‘at',
            'target_languages': ['tr'],
        })
        self.assertEqual(response.status_code, 302)
        generate.assert_called_once_with([
            {'key': 'nav_map', 'source_text': 'Xarita'},
            {'key': 'nav_words', 'source_text': 'Lug‘at'},
        ], ['tr'], user)

    def test_editor_cannot_publish_without_review_permission(self):
        user = get_user_model().objects.create_user('draft-editor', password='safe-test-password', is_staff=True)
        add_permission = Permission.objects.get(codename='add_interfacetranslation', content_type__app_label='korpus')
        user.user_permissions.add(add_permission)
        request = RequestFactory().post('/django-admin/')
        request.user = user
        item = InterfaceTranslation(key='Xarita', source_text='Xarita', language='tr', translated_text='Harita', status='published')
        admin.site._registry[InterfaceTranslation].save_model(request, item, None, change=False)
        self.assertEqual(item.status, 'draft')
        self.assertIsNone(item.reviewed_by)
