import json
from collections import Counter
from django.core.management.base import BaseCommand
from korpus.models import Monument, WordEntry
from korpus.corpus_scope import monument_quality


class Command(BaseCommand):
    help = 'Audit corpus dates, sources and aligned lines without changing data.'

    def add_arguments(self, parser):
        parser.add_argument('--json', action='store_true', dest='as_json')

    def handle(self, *args, **options):
        rows = []
        for monument in Monument.objects.prefetch_related('reading_lines').order_by('year', 'pk'):
            quality = monument_quality(monument)
            issues = []
            if not quality['in_period']:
                issues.append('outside_core_period')
            if not quality['has_bibliography']:
                issues.append('missing_bibliography')
            if not quality['editorial_line_count']:
                issues.append('needs_line_review')
            elif quality['complete_editorial_lines'] < quality['editorial_line_count']:
                issues.append('incomplete_editorial_layers')
            rows.append({'id': monument.pk, 'title': monument.title, 'year': monument.year,
                'year_end': monument.year_end, 'published': monument.status == 'Chop etilgan',
                'quality': quality, 'issues': issues})
        words = WordEntry.objects.filter(published=True)
        report = {'scope': {'start': 601, 'end': 800}, 'monuments': rows,
            'issue_counts': dict(Counter(issue for row in rows for issue in row['issues'])),
            'published_words': words.count(),
            'source_prepared_words': sum(word.provenance.get('verification') == 'source_prepared' for word in words),
            'source_prepared_lines': sum(row['quality']['source_prepared_lines'] for row in rows if row['published']),
            'expert_reviewed_lines': sum(row['quality']['expert_reviewed_lines'] for row in rows if row['published']),
            'reviewed_words': words.filter(reviewed_at__isnull=False, reviewed_by__isnull=False).count()}
        if options['as_json']:
            self.stdout.write(json.dumps(report, ensure_ascii=True, indent=2))
        else:
            for row in rows:
                self.stdout.write(f"{row['id']:>3} | {row['year']} | {row['title']} | {', '.join(row['issues']) or 'complete_editorial_record'}")
            self.stdout.write(json.dumps(report['issue_counts']))
            self.stdout.write(f"Published words: {report['published_words']}; reviewed: {report['reviewed_words']}")
