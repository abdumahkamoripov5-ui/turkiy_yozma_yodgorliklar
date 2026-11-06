"""Google Cloud Translation adapter. Credentials stay exclusively on the server."""
import json
import os
import re
import uuid
from functools import lru_cache
from datetime import timedelta


class TranslationNotConfigured(Exception):
    pass


class TranslationProviderError(Exception):
    pass


class TranslationRateLimited(Exception):
    pass


@lru_cache(maxsize=1)
def _client_and_project():
    project = os.environ.get('GOOGLE_TRANSLATE_PROJECT_ID', '').strip()
    credential_json = os.environ.get('GOOGLE_TRANSLATE_CREDENTIALS_JSON', '').strip()
    if not project or not credential_json:
        raise TranslationNotConfigured('Google Cloud Translation credentials are not configured.')
    try:
        from google.cloud import translate_v3
        from google.oauth2 import service_account
        from google.api_core.client_options import ClientOptions

        info = json.loads(credential_json)
        credentials = service_account.Credentials.from_service_account_info(
            info, scopes=['https://www.googleapis.com/auth/cloud-translation'],
        )
        location = os.environ.get('GOOGLE_TRANSLATE_LOCATION', 'global').strip() or 'global'
        options = None if location == 'global' else ClientOptions(api_endpoint=f'{location}-translation.googleapis.com')
        client = translate_v3.TranslationServiceClient(credentials=credentials, client_options=options)
        return client, project, location
    except TranslationNotConfigured:
        raise
    except Exception as exc:
        raise TranslationNotConfigured('Google Cloud Translation credentials could not be loaded.') from exc


def translate_interface_texts(source_texts, target_language):
    """Translate a group of public UI strings from Uzbek; never publish results."""
    client, project, location = _client_and_project()
    placeholder_pattern = re.compile(r'\{[A-Za-z_][A-Za-z0-9_]*\}')
    masked_sources = []
    placeholder_sets = []
    for source_text in source_texts:
        placeholders = []

        def mask(match):
            marker = f'ZXQTMPL{len(placeholders)}QXZ'
            placeholders.append((marker, match.group(0)))
            return marker

        masked_sources.append(placeholder_pattern.sub(mask, source_text))
        placeholder_sets.append(placeholders)
    request = {
        'parent': f'projects/{project}/locations/{location}',
        'contents': masked_sources,
        'mime_type': 'text/plain',
        'source_language_code': 'uz',
        'target_language_code': target_language,
    }
    glossary_id = os.environ.get('GOOGLE_TRANSLATE_GLOSSARY_ID', '').strip()
    if glossary_id:
        if location == 'global':
            raise TranslationNotConfigured('A regional GOOGLE_TRANSLATE_LOCATION is required when a glossary is configured.')
        request['glossary_config'] = {
            'glossary': f'projects/{project}/locations/{location}/glossaries/{glossary_id}',
        }
    try:
        result = client.translate_text(request=request)
        if glossary_id and result.glossary_translations:
            rows = result.glossary_translations
        else:
            rows = result.translations
        translations = [row.translated_text for row in rows]
        if len(translations) != len(source_texts) or any(not text.strip() for text in translations):
            raise TranslationProviderError('Google returned an empty translation.')
        restored = []
        for translation, placeholders in zip(translations, placeholder_sets):
            for marker, original in placeholders:
                if marker not in translation:
                    raise TranslationProviderError('Google changed an interface placeholder.')
                translation = translation.replace(marker, original)
            restored.append(translation)
        translations = restored
        return translations
    except TranslationProviderError:
        raise
    except Exception as exc:
        raise TranslationProviderError('Google Cloud Translation request failed.') from exc


def generate_interface_translation_batch(items, target_languages, user):
    """Translate missing or changed UI strings and save drafts atomically."""
    from django.db import transaction
    from .translation_models import InterfaceTranslation

    batch_id = uuid.uuid4()
    unchanged = []
    pending = []
    from django.utils import timezone
    cutoff = timezone.now() - timedelta(hours=1)
    recent_batches = InterfaceTranslation.objects.filter(
        generated_by=user, updated_at__gte=cutoff,
    ).values_list('batch_id', flat=True).distinct().count()
    for item in items:
        for language in target_languages:
            existing = InterfaceTranslation.objects.filter(key=item['key'], language=language).first()
            if existing and existing.source_text == item['source_text']:
                unchanged.append({'key': item['key'], 'language': language, 'status': 'unchanged', 'id': existing.pk})
            else:
                pending.append((existing, item['key'], item['source_text'], language))

    if pending and recent_batches >= 5:
        raise TranslationRateLimited('Bir foydalanuvchi uchun soatiga 5 ta Google tarjima to‘plami ruxsat etiladi.')
    translated = []
    for language in target_languages:
        group = [row for row in pending if row[3] == language]
        if not group:
            continue
        outputs = translate_interface_texts([row[2] for row in group], language)
        translated.extend((row[0], row[1], row[2], language, output) for row, output in zip(group, outputs))

    results = list(unchanged)
    with transaction.atomic():
        for existing, key, source_text, language, translated_text in translated:
            item = existing or InterfaceTranslation(key=key, language=language)
            item.source_text = source_text
            item.translated_text = translated_text
            item.status = 'draft'
            item.provider = 'google'
            item.generated_by = user
            item.reviewed_by = None
            item.reviewed_at = None
            item.batch_id = batch_id
            item.save()
            results.append({'key': key, 'language': language, 'status': 'draft', 'id': item.pk, 'translation': item.translated_text})
    return batch_id, results


def generate_interface_translation_drafts(key, source_text, target_languages, user):
    return generate_interface_translation_batch([{'key': key, 'source_text': source_text}], target_languages, user)
