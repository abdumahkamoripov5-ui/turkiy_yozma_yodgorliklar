"""Install the checked-in source package; never overwrite editorial changes."""
import hashlib
import json
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from korpus.models import Monument, MonumentLine, WordEntry, SourceLink

DATA_FILE = Path(__file__).resolve().parents[2] / 'data' / 'thomsen1896-v1.json'


def load_package():
    data = json.loads(DATA_FILE.read_text(encoding='utf-8'))
    labels = set()
    for row in data['lines']:
        if row['label'] in labels or row['monument_key'] not in ('kultegin', 'bilge'):
            raise CommandError('Duplicate source label or unknown monument.')
        labels.add(row['label'])
        if not row['transliteration'].strip() or not row['provenance'].get('source_translation'):
            raise CommandError('Every passage needs a reading and a source translation.')
        if not row['pages'] or row['provenance']['verification'] != 'source_prepared':
            raise CommandError('Missing edition locator or unsupported verification state.')
    for word in data['words']:
        line = next((row for row in data['lines'] if row['label'] == word['line_label']), None)
        if line is None or not all(form.casefold() in line['transliteration'].casefold() for form in word['provenance']['attested_forms']):
            raise CommandError('Dictionary attestation is absent from its named source passage.')
    return data


class Command(BaseCommand):
    help = 'Install the source-prepared Thomsen 1896 selection and contextual dictionary; no expert approval is fabricated.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--archive-samples', action='store_true')
        parser.add_argument('--sync-excerpts', action='store_true')
        parser.add_argument('--quarantine-unsourced', action='store_true')

    def handle(self, *args, **options):
        data = load_package()
        if options['dry_run']:
            self.stdout.write(f"Valid source package: {len(data['lines'])} passages, {len(data['words'])} contextual glosses. No database changes.")
            return
        stats = {'lines_created': 0, 'words_created': 0, 'existing_preserved': 0, 'samples_archived': 0, 'unsourced_quarantined': 0}
        with transaction.atomic():
            monuments = {}
            for key, year, names, title in [
                ('kultegin', 732, ['Kültigin bitigi', 'Kultegin bitiktoshi'], 'Kültigin bitigi'),
                ('bilge', 735, ['Bilge Xoqon bitigi', 'Bilga xoqon bitiktoshi'], 'Bilge Xoqon bitigi'),
            ]:
                matches = Monument.objects.select_for_update().filter(year=year, title__in=names)
                if matches.count() > 1:
                    raise CommandError('Ambiguous monument identity; resolve duplicates in the admin first.')
                monument = matches.first()
                if monument is None:
                    monument = Monument.objects.create(title=title, year=year, location='Orkhon Valley, Mongolia',
                        script='koktürk', category='bitiglar', description='Selected source-prepared passages from Thomsen (1896); not a complete critical edition.',
                        bibliography=[data['edition']['title'] + ' (1896). ' + data['edition']['url']], status='Chop etilgan')
                monuments[key] = monument
            lines = {}
            for row in data['lines']:
                defaults = {key: row[key] for key in ('label', 'original', 'transliteration', 'translation', 'certainty')}
                defaults.update(source=f"Thomsen (1896), pp. {', '.join(map(str,row['pages']))}; {row['label']}. {row['provenance']['scan_url']}",
                    editorial_note=row['note'], provenance=row['provenance'], published=True)
                candidate = MonumentLine(monument=monuments[row['monument_key']], position=row['position'], **defaults)
                candidate.full_clean(validate_unique=False, validate_constraints=False)
                existing = MonumentLine.objects.filter(monument=candidate.monument, position=candidate.position).first()
                if existing:
                    if existing.provenance.get('release') != data['release']:
                        raise CommandError(f"Position collision for {row['label']}; existing editorial content was not changed.")
                    lines[row['label']] = existing
                    stats['existing_preserved'] += 1
                else:
                    candidate.save()
                    lines[row['label']] = candidate
                    stats['lines_created'] += 1
            for row in data['words']:
                line = lines[row['line_label']]
                provenance = {**row['provenance'], 'line_id': line.pk, 'monument_id': line.monument_id, 'position': line.position}
                existing = WordEntry.objects.filter(word=row['word']).first()
                if existing:
                    stats['existing_preserved'] += 1
                    continue
                word = WordEntry(word=row['word'], meaning=row['meaning'], example=row['example'], source=row['source'],
                    equivalents=row['equivalents'], monument=line.monument, provenance=provenance, published=True)
                word.full_clean()
                word.save()
                stats['words_created'] += 1
            if options['sync_excerpts'] or stats['lines_created']:
                for monument in monuments.values():
                    passages = list(monument.reading_lines.filter(published=True).order_by('position'))
                    monument.full_text = '\n'.join(line.original for line in passages if line.original)
                    monument.transliteration = '\n'.join(line.transliteration for line in passages)
                    monument.translation = '\n'.join(line.translation for line in passages)
                    monument.line_count = len(passages)
                    monument.word_count = sum(len(line.transliteration.split()) for line in passages)
                    monument.save(update_fields=['full_text', 'transliteration', 'translation', 'line_count', 'word_count', 'updated_at'])
            SourceLink.objects.get_or_create(url=data['edition']['url'], defaults={
                'title': 'Thomsen (1896) — Inscriptions de l’Orkhon déchiffrées',
                'description': 'Manba nashri va to‘liq skan: University of Michigan / Google / Internet Archive. Korpusda tanlangan parchalar, ishchi normalizatsiya va filolog tasdiqlamagan o‘zbekcha tarjima beriladi.',
                'published': True})
            if options['archive_samples']:
                samples = WordEntry.objects.filter(word__in=['bitik', 'bilim', 'el'], reviewed_by__isnull=True, published=True,
                    source__startswith='O‘quv namunasi.', provenance={})
                stats['samples_archived'] = samples.update(published=False)
            if options['quarantine_unsourced']:
                names = ['Tonyuquq bitigi', 'Ongin bitigi', 'Kul-chur bitigi (Ixe-Xushotu)', 'Tariat (Terxin) bitigi', 'Shine-Usu bitigi']
                candidates = Monument.objects.filter(title__in=names, status='Chop etilgan', is_user_submission=False).exclude(reading_lines__published=True)
                stats['unsourced_quarantined'] = candidates.update(status='Qoralama')
        self.stdout.write(json.dumps(stats))
