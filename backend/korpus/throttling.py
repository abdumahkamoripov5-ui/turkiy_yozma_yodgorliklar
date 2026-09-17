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
