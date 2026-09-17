"""Mijozning haqiqiy IP manzilini aniqlash.

X-Forwarded-For sarlavhasini mijozning o'zi yuborishi (soxtalashtirishi) mumkin,
shuning uchun unga ko'r-ko'rona ishonilmaydi. IP faqat settings.CLIENT_IP_HEADER da
ko'rsatilgan, ishonchli proksi qo'yadigan sarlavhadan olinadi:

  * Render (Cloudflare ortida) — HTTP_TRUE_CLIENT_IP (Cloudflare uni doim qayta yozadi)
  * boshqa proksi — muhitdan CLIENT_IP_HEADER, masalan HTTP_X_REAL_IP
  * proksisiz (lokal) — REMOTE_ADDR
"""
import ipaddress

from django.conf import settings


def _valid(ip):
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False


def client_ip(request):
    if request is None:
        return None
    header = getattr(settings, 'CLIENT_IP_HEADER', '')
    if header:
        ip = request.META.get(header, '').split(',')[0].strip()
        if ip and _valid(ip):
            return ip
    ip = request.META.get('REMOTE_ADDR')
    return ip if ip and _valid(ip) else None
