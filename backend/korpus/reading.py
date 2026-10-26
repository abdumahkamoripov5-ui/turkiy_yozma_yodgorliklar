"""Keep editorial alignments distinct from provisional newline matches."""
import unicodedata


def normalize_word(value):
    value = unicodedata.normalize('NFC', value).casefold()
    return value.translate(str.maketrans({'’': "'", '‘': "'", 'ʻ': "'", 'ʼ': "'", 'ʹ': "'"})).strip()


def reading_data(monument):
    fields = ('id', 'position', 'label', 'original', 'transliteration', 'translation', 'source',
              'facsimile_url', 'image_region', 'certainty', 'editorial_note')
    lines = [{field: getattr(line, field) for field in fields}
             for line in monument.reading_lines.all() if line.published]
    if lines:
        return {'alignment': 'editorial', 'lines': lines}
    columns = [value.strip().splitlines() if value.strip() else [] for value in
               [monument.full_text, monument.transliteration, monument.translation]]
    # Never shift missing lines or pair texts of different lengths.
    if not columns[0] or len({len(column) for column in columns}) != 1:
        return {'alignment': 'unavailable', 'lines': []}
    return {'alignment': 'automatic', 'lines': [
        {'id': None, 'position': index, 'label': str(index), 'original': row[0],
         'transliteration': row[1], 'translation': row[2], 'source': ''}
        for index, row in enumerate(zip(*columns), start=1)
    ]}
