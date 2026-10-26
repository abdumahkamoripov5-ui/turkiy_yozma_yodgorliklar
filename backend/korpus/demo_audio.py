"""Bundled public AI demos for the original three educational sample entries."""
from django.templatetags.static import static

DEMO_WORDS = frozenset(['bilim', 'bitik', 'el'])
SAMPLE_SOURCE = 'O‘quv namunasi. Ilmiy nashrga bog‘lash uchun ekspert tekshiruvi zarur.'


def demo_audio_url(entry):
    # Never attach a sample recording to a scholarly entry or a different reading.
    if entry.word in DEMO_WORDS and entry.source == SAMPLE_SOURCE and not entry.pronunciation:
        return static(f'korpus/audio/demo/{entry.word}.mp3')
    return None
