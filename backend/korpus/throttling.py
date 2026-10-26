"""DRF throttle'lari — anonim foydalanuvchini ishonchli IP bo'yicha aniqlaydi.

DRF standart holatda (NUM_PROXIES berilmasa) butun X-Forwarded-For qatorini
identifikator qiladi — sarlavhani o'zgartirib cheklovni chetlab o'tish mumkin edi.
"""
from rest_framework import throttling

from .ip import client_ip


class ClientIPMixin:
    def get_ident(self, request):
        return client_ip(request) or 'unknown'


class AnonRateThrottle(ClientIPMixin, throttling.AnonRateThrottle):
    pass


class UserRateThrottle(ClientIPMixin, throttling.UserRateThrottle):
    pass


class ScopedRateThrottle(ClientIPMixin, throttling.ScopedRateThrottle):
    pass


class _FixedScopeThrottle(ClientIPMixin, throttling.SimpleRateThrottle):
    """Tayinlangan scope bo'yicha cheklov. Scope'ni view emas, klassning o'zi belgilaydi."""
    scope = None

    def get_cache_key(self, request, view):
        user = getattr(request, 'user', None)
        ident = f'user:{user.pk}' if user and user.is_authenticated else self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}


class SearchRateThrottle(_FixedScopeThrottle):
    """Og'ir qidiruv (konkordans, so'z chastotasi) — settings: 'search'."""
    scope = 'search'


class ExportRateThrottle(_FixedScopeThrottle):
    """Butun korpusni yuklab olish (eksport) — settings: 'export'."""
    scope = 'export'
