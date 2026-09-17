"""Kirish/chiqish hodisalarini LoginActivity jadvaliga yozib boradi."""
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver

from .ip import client_ip


def client_agent(request):
    if request is None:
        return ''
    return request.META.get('HTTP_USER_AGENT', '')[:300]


def record(request, event, user=None, username=''):
    from .models import LoginActivity
    # /api/... orqali kelgan bo'lsa — sayt (JWT), aks holda admin panel (sessiya)
    via = 'api' if request is not None and request.path.startswith('/api/') else 'admin'
    LoginActivity.objects.create(
        user=user,
        username=username or (user.username if user else ''),
        event=event,
        via=via,
        ip=client_ip(request),
        user_agent=client_agent(request),
    )


@receiver(user_logged_in)
def on_login(sender, request, user, **kwargs):
    record(request, 'login', user=user)


@receiver(user_logged_out)
def on_logout(sender, request, user, **kwargs):
    if user is not None:
        record(request, 'logout', user=user)


@receiver(user_login_failed)
def on_login_failed(sender, credentials, request=None, **kwargs):
    record(request, 'failed', username=credentials.get('username', ''))
