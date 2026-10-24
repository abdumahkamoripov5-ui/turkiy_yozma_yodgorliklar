"""A fixed public selection; filtering and pagination cannot widen it."""
from .models import Monument, WordEntry

PREVIEW_LIMIT = 3


def preview_monuments():
    published = Monument.objects.filter(status='Chop etilgan')
    ids = published.order_by('-featured', 'year', 'pk').values('pk')[:PREVIEW_LIMIT]
    return published.filter(pk__in=ids)


def preview_words():
    published = WordEntry.objects.filter(published=True)
    ids = published.order_by('pk').values('pk')[:PREVIEW_LIMIT]
    return published.filter(pk__in=ids)
