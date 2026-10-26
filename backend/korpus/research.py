"""Shared, bounded corpus queries. Search spans always refer to original text."""
import re
import unicodedata
from collections import Counter, defaultdict
from urllib.parse import urlencode

from django.db.models import Q
from rest_framework.exceptions import ValidationError

from .models import Monument, WordForm
from .reading import reading_data

FIELDS = {'original': 'Asl matn', 'transliteration': 'Transliteratsiya', 'translation': 'Tarjima'}
WORD_RE = re.compile(r"[^\W\d_]+(?:[\u0300-\u036f]+[^\W\d_]*|['’‘ʻʼʹ-][^\W\d_]+)*", re.UNICODE)
APOSTROPHES = str.maketrans({c: "'" for c in '’‘ʻʼʹ'})
MAX_MATCHES = 10000


def integer(params, key, default, low, high):
    value = params.get(key, '')
    try:
        number = default if value in ('', None) else int(value)
    except (ValueError, TypeError):
        raise ValidationError({key: 'Butun son kiriting.'})
    if not low <= number <= high:
        raise ValidationError({key: f'{low}–{high} oralig‘ida kiriting.'})
    return number


def filtered_monuments(params):
    qs = Monument.objects.filter(status='Chop etilgan').order_by('year', 'pk')
    search = params.get('search', '').strip()
    if search:
        if len(search) > 150:
            raise ValidationError({'search': 'Ko‘pi bilan 150 belgi kiriting.'})
        for quoted, plain in re.findall(r'"([^"]+)"|(\S+)', search):
            term = quoted or plain
            qs = qs.filter(Q(title__icontains=term) | Q(title_original__icontains=term)
                | Q(description__icontains=term) | Q(location__icontains=term)
                | Q(full_text__icontains=term) | Q(transliteration__icontains=term) | Q(translation__icontains=term))
    for key in ('script', 'category', 'language'):
        value = params.get(key, '').strip()
        if value:
            qs = qs.filter(**{f'{key}__iexact': value[:150]})
    location = params.get('location', '').strip()
    if location:
        qs = qs.filter(location__icontains=location[:250])
    low = integer(params, 'year_min', -10000, -10000, 10000)
    high = integer(params, 'year_max', 10000, -10000, 10000)
    if low > high:
        raise ValidationError({'year_max': 'Tugash yili boshlanish yilidan kichik bo‘lmasin.'})
    # A work spanning several years belongs to every overlapping interval.
    qs = qs.filter(year__lte=high).filter(Q(year_end__gte=low) | Q(year_end__isnull=True, year__gte=low))
    selected = params.get('monuments', '').strip()
    if selected:
        parts = selected.split(',')
        if len(parts) > 100 or any(not part.isdigit() for part in parts):
            raise ValidationError({'monuments': 'Vergul bilan ajratilgan ko‘pi bilan 100 ta ID kiriting.'})
        qs = qs.filter(pk__in=[int(part) for part in parts])
    source = params.get('source', '').strip()
    if source:
        qs = qs.filter(Q(bibliography__icontains=source[:250]) | Q(reading_lines__published=True, reading_lines__source__icontains=source[:250])).distinct()
    return qs.prefetch_related('reading_lines')


def canonical(value, normalize=True, case_sensitive=False):
    value = unicodedata.normalize('NFC', value)
    if normalize:
        value = value.translate(APOSTROPHES)
    return value if case_sensitive else value.casefold()


def indexed_text(text, normalize=True, case_sensitive=False):
    output, starts, ends = [], [], []
    # Combining characters stay attached to their base during NFC/case folding.
    clusters = []
    for index, char in enumerate(text):
        if clusters and unicodedata.category(char).startswith('M'):
            clusters[-1][0] += char
            clusters[-1][2] = index + 1
        else:
            clusters.append([char, index, index + 1])
    for cluster, start, end in clusters:
        transformed = canonical(cluster, normalize, case_sensitive)
        output.append(transformed)
        starts.extend([start] * len(transformed))
        ends.extend([end] * len(transformed))
    return ''.join(output), starts, ends


def query_options(params, required=True):
    query = params.get('q', '').strip()
    if (required and not query) or len(query) > 150:
        raise ValidationError({'q': '1–150 belgili so‘z yoki ibora kiriting.'})
    field = params.get('field', 'all')
    if field not in (*FIELDS, 'all'):
        raise ValidationError({'field': 'Asl matn, transliteratsiya yoki tarjimani tanlang.'})
    mode = params.get('mode', 'word')
    if mode not in ('word', 'substring', 'phrase', 'lemma'):
        raise ValidationError({'mode': 'Qidiruv usuli noto‘g‘ri.'})
    normalize = params.get('normalize', '1') != '0'
    case_sensitive = params.get('case_sensitive', '0') == '1'
    forms = [query]
    analyses = []
    if mode == 'lemma' and query:
        key = canonical(query)
        for form in WordForm.objects.filter(published=True, reviewed=True, reviewed_by__isnull=False):
            if canonical(form.lemma) == key:
                forms.append(form.form)
                analyses.append(form.pk)
    forms = sorted(set(canonical(form, normalize, case_sensitive) for form in forms if form), key=lambda x: (-len(x), x))
    expression = '|'.join(re.escape(form) for form in forms)
    if mode != 'substring':
        expression = rf"(?<![\w\u0300-\u036f])(?<!\w['’‘ʻʼʹ-])(?:{expression})(?![\w\u0300-\u036f])(?!['’‘ʻʼʹ-]\w)"
    return {'query': query, 'field': field, 'mode': mode, 'normalize': normalize,
            'case_sensitive': case_sensitive, 'pattern': re.compile(expression),
            'forms': forms, 'analysis_ids': analyses}


def find_spans(text, options):
    normalized, starts, ends = indexed_text(text, options['normalize'], options['case_sensitive'])
    for match in options['pattern'].finditer(normalized):
        if match.end() > match.start():
            yield starts[match.start()], ends[match.end() - 1]


def bibliography_text(monument):
    entries = monument.bibliography if isinstance(monument.bibliography, list) else []
    return '; '.join(str(item.get('citation') or item.get('title') or item.get('text') or '') if isinstance(item, dict) else str(item) for item in entries)


def corpus_rows(monument):
    reading = reading_data(monument)
    if reading['lines']:
        for line in reading['lines']:
            yield {**line, 'alignment': reading['alignment']}
    else:
        # Independent columns are never advertised as aligned translations.
        for field, attr in [('original', 'full_text'), ('transliteration', 'transliteration'), ('translation', 'translation')]:
            for position, text in enumerate((getattr(monument, attr) or '').splitlines(), 1):
                if text.strip():
                    yield {'position': position, 'label': str(position), field: text,
                           'source': '', 'alignment': 'unavailable'}


def result_target(monument_id, position=None):
    return '/monuments?' + urlencode({'monument': monument_id}) + (f'#line-{position}' if position else '')


def search_corpus(params):
    options = query_options(params)
    context = integer(params, 'context', 60, 15, 250)
    page = integer(params, 'page', 1, 1, 10000)
    page_size = integer(params, 'page_size', 25, 1, 100)
    ordering = params.get('sort', 'source')
    if ordering not in ('source', 'left', 'right', 'match', 'title'):
        raise ValidationError({'sort': 'Saralash usuli noto‘g‘ri.'})
    results = []
    qs = filtered_monuments(params)
    document_count = qs.count()
    fields = FIELDS if options['field'] == 'all' else [options['field']]
    truncated = False
    for monument in qs.iterator(chunk_size=25):
        source = bibliography_text(monument)
        for line in corpus_rows(monument):
            for field in fields:
                text = line.get(field, '')
                for start, end in find_spans(text, options):
                    if len(results) == MAX_MATCHES:
                        truncated = True
                        break
                    aligned = line['alignment'] != 'unavailable'
                    results.append({
                        'monumentId': monument.pk, 'monumentTitle': monument.title, 'year': monument.year,
                        'location': monument.location, 'field': FIELDS[field], 'field_key': field,
                        'position': line['position'], 'label': line.get('label') or str(line['position']),
                        'alignment': line['alignment'], 'source': line.get('source') or source,
                        'left': text[max(0, start - context):start], 'match': text[start:end],
                        'right': text[end:end + context], 'text': text,
                        'target': result_target(monument.pk, line['position'] if aligned else None),
                    })
                if truncated:
                    break
            if truncated:
                break
        if truncated:
            break
    if ordering in ('left', 'right', 'match', 'title'):
        key = 'monumentTitle' if ordering == 'title' else ordering
        results.sort(key=lambda row: canonical(row[key][::-1] if ordering == 'left' else row[key]))
    start = (page - 1) * page_size
    return {'query': options['query'], 'count': len(results), 'page': page,
            'page_size': page_size, 'document_count': document_count, 'truncated': truncated,
            'forms': options['forms'], 'analysis_count': len(options['analysis_ids']),
            'results': results[start:start + page_size], '_all': results}


def frequency_data(params):
    field = params.get('field', 'transliteration')
    if field not in FIELDS:
        raise ValidationError({'field': 'Statistika uchun bitta matn turini tanlang.'})
    limit = integer(params, 'limit', 100, 1, 500)
    minimum = integer(params, 'min_count', 1, 1, 1000000)
    min_length = integer(params, 'min_length', 1, 1, 100)
    counts, documents, totals = Counter(), defaultdict(set), []
    query = canonical(params.get('q', '').strip())
    qs = filtered_monuments(params)
    for monument in qs.iterator(chunk_size=25):
        tokens = [canonical(token) for line in corpus_rows(monument) for token in WORD_RE.findall(line.get(field, ''))]
        counts.update(tokens)
        for word in set(tokens):
            documents[word].add(monument.pk)
        matched = sum(1 for token in tokens if query and query in token)
        totals.append({'id': monument.pk, 'title': monument.title, 'year': monument.year, 'tokens': len(tokens),
                       'matches': matched, 'matches_per_10000': round(matched / len(tokens) * 10000, 3) if tokens else 0})
    total = sum(counts.values())
    results = [{'word': word, 'count': count, 'documents': len(documents[word]),
                'per_10000': round(count / total * 10000, 3) if total else 0}
               for word, count in counts.most_common()
               if count >= minimum and len(word) >= min_length and (not query or query in word)]
    return {'total_tokens': total, 'unique_words': len(counts), 'document_count': len(totals),
            'count': len(results), 'results': results[:limit], 'documents': totals, 'field': field,
            'truncated': len(results) > limit}


def collocation_data(params):
    options = query_options(params)
    if options['field'] == 'all':
        options['field'] = 'transliteration'
    window = integer(params, 'window', 5, 1, 10)
    minimum = integer(params, 'min_count', 1, 1, 1000000)
    neighbors = defaultdict(lambda: {'count': 0, 'left': 0, 'right': 0, 'documents': set()})
    target_count = 0
    for monument in filtered_monuments(params).iterator(chunk_size=25):
        for line in corpus_rows(monument):
            text = line.get(options['field'], '')
            words = list(WORD_RE.finditer(text))
            for start, end in find_spans(text, options):
                matched = [index for index, word in enumerate(words) if word.start() < end and word.end() > start]
                if not matched:
                    continue
                target_count += 1
                for side, indexes in [('left', range(max(0, matched[0] - window), matched[0])),
                                      ('right', range(matched[-1] + 1, min(len(words), matched[-1] + 1 + window)))]:
                    for index in indexes:
                        key = canonical(words[index].group())
                        entry = neighbors[key]
                        entry['count'] += 1
                        entry[side] += 1
                        entry['documents'].add(monument.pk)
    rows = [{'word': word, **{key: len(value) if key == 'documents' else value for key, value in row.items()}}
            for word, row in neighbors.items() if row['count'] >= minimum]
    rows.sort(key=lambda row: (-row['count'], row['word']))
    return {'query': options['query'], 'window': window, 'target_occurrences': target_count,
            'count': len(rows), 'results': rows[:200], 'truncated': len(rows) > 200}
