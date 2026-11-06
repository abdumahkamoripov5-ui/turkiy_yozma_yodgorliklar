"""Validate source-backed aligned rows; imported rows always await editor review."""
import csv
from pathlib import Path
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from korpus.models import Monument, MonumentLine
from korpus.corpus_scope import core_monuments

COLUMNS = ('monument_id', 'position', 'label', 'original', 'transliteration', 'translation', 'source')


class Command(BaseCommand):
    help = 'Validate parallel-text CSV. Use --apply to import new draft lines; never publishes or overwrites.'

    def add_arguments(self, parser):
        parser.add_argument('file')
        parser.add_argument('--apply', action='store_true')

    def handle(self, *args, **options):
        path = Path(options['file'])
        if not path.is_file() or path.stat().st_size > 4_000_000:
            raise CommandError('CSV file must exist and be smaller than 4 MB.')
        candidates = []
        seen = set()
        try:
            with path.open(encoding='utf-8-sig', newline='') as stream:
                reader = csv.DictReader(stream)
                if reader.fieldnames != list(COLUMNS):
                    raise CommandError('Required columns, in order: ' + ','.join(COLUMNS))
                for number, row in enumerate(reader, start=2):
                    if number > 2001:
                        raise CommandError('Maximum 2000 lines per import.')
                    if any(row.get(key) is None or not row[key].strip() for key in COLUMNS):
                        raise CommandError(f'Row {number}: all columns, including edition and page, are required.')
                    try:
                        monument_id, position = int(row['monument_id']), int(row['position'])
                    except ValueError:
                        raise CommandError(f'Row {number}: monument_id and position must be integers.')
                    key = (monument_id, position)
                    if position < 1 or key in seen:
                        raise CommandError(f'Row {number}: positive, unique line position required.')
                    seen.add(key)
                    if not core_monuments(Monument.objects.all()).filter(pk=monument_id).exists():
                        raise CommandError(f'Row {number}: monument is missing or outside centuries VII–VIII.')
                    if MonumentLine.objects.filter(monument_id=monument_id, position=position).exists():
                        raise CommandError(f'Row {number}: line already exists; edit it in the admin instead.')
                    line = MonumentLine(monument_id=monument_id, position=position,
                        **{key: row[key].strip() for key in COLUMNS[2:]}, published=False)
                    line.full_clean()
                    candidates.append(line)
        except (UnicodeError, csv.Error, ValidationError) as error:
            raise CommandError(str(error))
        if not candidates:
            raise CommandError('No text lines found in CSV.')
        if options['apply']:
            with transaction.atomic():
                MonumentLine.objects.bulk_create(candidates)
            self.stdout.write(f'{len(candidates)} draft lines imported. Review and publish in the admin.')
        else:
            self.stdout.write(f'{len(candidates)} valid lines. No changes made. Use --apply to import drafts.')
