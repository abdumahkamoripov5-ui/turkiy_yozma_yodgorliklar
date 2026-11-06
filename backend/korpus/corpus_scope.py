from django.db.models import F, Q

START_YEAR = 601
END_YEAR = 800


def core_monuments(queryset):
    """Only monuments whose complete assigned date lies in centuries VII–VIII.

    Broad ranges such as 700–900 stay in the editorial archive until dated more
    precisely. This does not delete or change any stored historical material.
    """
    return queryset.filter(year__gte=START_YEAR, year__lte=END_YEAR).filter(
        Q(year_end__isnull=True) | Q(year_end__gte=F('year'), year_end__lte=END_YEAR))


def apply_scope(queryset, params):
    return core_monuments(queryset) if params.get('scope') == 'core' else queryset


def monument_quality(monument):
    lines = [line for line in monument.reading_lines.all() if line.published]
    in_period = START_YEAR <= monument.year <= END_YEAR and (
        monument.year_end is None or monument.year <= monument.year_end <= END_YEAR)
    return {
        'in_period': in_period,
        'has_bibliography': bool(monument.bibliography),
        'alignment': 'editorial' if lines else 'provisional',
        'editorial_line_count': len(lines),
        'source_prepared_lines': sum(line.provenance.get('verification') == 'source_prepared' for line in lines),
        'expert_reviewed_lines': sum(bool(line.reviewed_by_id and line.reviewed_at) for line in lines),
        'coverage': 'selected_passages' if any(line.provenance.get('excerpt') for line in lines) else 'unspecified',
        'complete_editorial_lines': sum(bool(line.original.strip() and line.transliteration.strip()
            and line.translation.strip() and line.source.strip()) for line in lines),
        'review_status': 'editorial_lines' if lines else 'needs_review',
        'reuse_rights': 'consult_source',
    }
