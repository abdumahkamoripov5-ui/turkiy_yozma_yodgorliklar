from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, Http404
from django.views.generic import RedirectView
from django.views.static import serve as serve_file
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from korpus import api as korpus_api

# ── DRF Router ────────────────────────────────────────────────────────────────
router = DefaultRouter()
router.register(r'monuments', korpus_api.MonumentViewSet, basename='monument')


def react_index(request):
    """Serve React SPA index.html. Assets (/app/assets/*) are handled by static()."""
    index = settings.REACT_BUILD_DIR / 'index.html'
    if index.exists():
        return FileResponse(open(index, 'rb'), content_type='text/html')
    raise Http404("React build topilmadi. cd frontend && npm run build")


urlpatterns = [
    # Django admin
    path('django-admin/', admin.site.urls),

    # ── REST API v2 ───────────────────────────────────────────────────────────
    path('api/v2/', include(router.urls)),
    path('api/v2/auth/token/',         korpus_api.CustomTokenObtainPairView.as_view(), name='token-obtain'),
    path('api/v2/auth/token/refresh/', TokenRefreshView.as_view(),                     name='token-refresh'),
    path('api/v2/submit/',             korpus_api.SubmissionCreateView.as_view(),       name='v2-submit'),
    path('api/v2/settings/',           korpus_api.SiteSettingsView.as_view(),           name='v2-settings'),
    path('api/v2/export/',             korpus_api.ExportView.as_view(),                 name='v2-export'),
    path('api/v2/submission-image/<int:pk>/', korpus_api.SubmissionImageView.as_view(), name='v2-submission-image'),

    # ── React SPA ─────────────────────────────────────────────────────────────
    # /app/assets/* — React build fayllari. static() faqat DEBUG'da ishlaydi,
    # shuning uchun production'da ham doim serve_file orqali uzatiladi.
    # /app/<any-route> — React client-side routing, all return index.html
    re_path(r'^app/assets/(?P<path>.*)$', serve_file,
            {'document_root': settings.REACT_BUILD_DIR / 'assets'}),
    path('app/vite.svg', serve_file, {'document_root': settings.REACT_BUILD_DIR, 'path': 'vite.svg'}),
    re_path(r'^app/(?!assets/).*$', react_index),

    # ── Bosh sahifa: saytga yo'naltirish (lokalda /app/, prodda Vercel) ───────
    path('', RedirectView.as_view(url=settings.FRONTEND_URL, permanent=False)),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Yuklangan fayllar lokal diskda bo'lsa (S3/R2 ulanmagan), ularni Django o'zi uzatadi.
# static() faqat DEBUG=True'da ishlaydi — production'da rasmlar 404 bo'lib qolardi.
if not settings.AWS_STORAGE_BUCKET_NAME:
    urlpatterns.append(
        re_path(r'^media/(?P<path>.*)$', serve_file, {'document_root': settings.MEDIA_ROOT})
    )
