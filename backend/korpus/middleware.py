from .models import UserActivity


class ActivityMiddleware:
    """Record authenticated API actions without passwords, tokens or query text."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith('/api/v2/') and not request.path.endswith('/health/'):
            response['Cache-Control'] = 'private, no-store'
            user = getattr(request, 'user', None)
            if user and user.is_authenticated:
                UserActivity.objects.create(user=user, method=request.method,
                                            path=request.path[:250], status=response.status_code)
        return response
