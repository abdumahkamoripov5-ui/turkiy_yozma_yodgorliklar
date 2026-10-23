from pathlib import Path
import os

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

# Standart — xavfsiz (DEBUG o'chiq). Lokal dev'da run.sh DJANGO_DEBUG=True qo'yadi.
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
IS_VERCEL = os.environ.get('VERCEL') == '1'

# Production'da DJANGO_SECRET_KEY env'dan beriladi; dev kaliti faqat DEBUG rejimida.
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured(
            "DJANGO_SECRET_KEY berilmagan. Lokal dev uchun: export DJANGO_DEBUG=True"
        )
    SECRET_KEY = 'django-insecure-dev-only-key-change-in-production'

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '127.0.0.1 localhost').split()

# Render deploy hostini avtomatik qo'shadi
_render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if _render_host and _render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)

_vercel_hosts = [os.environ.get(key, '') for key in (
    'VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_BRANCH_URL'
)] if IS_VERCEL else []
ALLOWED_HOSTS.extend(host for host in _vercel_hosts if host and host not in ALLOWED_HOSTS)

# Mijoz IP'si qaysi sarlavhadan olinadi (korpus/ip.py). Bo'sh — REMOTE_ADDR.
# Render Cloudflare ortida: True-Client-IP'ni Cloudflare doim qayta yozadi (soxtalashtirib bo'lmaydi).
CLIENT_IP_HEADER = os.environ.get(
    'CLIENT_IP_HEADER',
    'HTTP_TRUE_CLIENT_IP' if os.environ.get('RENDER') else ''
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # eski refresh tokenlarni bekor qilish
    'django_filters',
    'corsheaders',
    # Local
    'korpus',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',          # CORS — birinchi bo'lishi shart
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',     # statik fayllar (production)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'turkiy_korpus.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.application' if IS_VERCEL else 'turkiy_korpus.wsgi.application'

# ── Database — Render DATABASE_URL > PostgreSQL > SQLite ─────────────────────
_DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
_USE_POSTGRES = os.environ.get('USE_POSTGRES', 'False') == 'True'
if IS_VERCEL and not _DATABASE_URL:
    raise ImproperlyConfigured('Vercel uchun tashqi PostgreSQL DATABASE_URL kerak; SQLite doimiy emas.')
if IS_VERCEL and not _DATABASE_URL.startswith(('postgres://', 'postgresql://')):
    raise ImproperlyConfigured(
        'DATABASE_URL qiymati Render External Database URL bo‘lishi kerak '
        '(postgres:// yoki postgresql:// bilan boshlanadi). Qiymat xavfsizlik uchun chiqarilmadi.'
    )

if _DATABASE_URL:
    # Render avtomatik beradigan DATABASE_URL
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(_DATABASE_URL, conn_max_age=0 if IS_VERCEL else 600, ssl_require=True)
    }
elif _USE_POSTGRES:
    DATABASES = {
        'default': {
            'ENGINE':   'django.db.backends.postgresql',
            'NAME':     os.environ.get('DB_NAME',     'turkiy_korpus'),
            'USER':     os.environ.get('DB_USER',     'turkiy_user'),
            # Parol kodda qattiq yozilmaydi — faqat env'dan (DB_PASSWORD)
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST':     os.environ.get('DB_HOST',     'localhost'),
            'PORT':     os.environ.get('DB_PORT',     '5432'),
            'OPTIONS':  {'connect_timeout': 10},
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME':   BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'uz'
TIME_ZONE     = 'Asia/Tashkent'
USE_I18N      = True
USE_TZ        = True

STATIC_URL = '/static/'
STATICFILES_DIRS = []
# React build assets — /static/react/assets/ orqali (frontend/ — backend/ ning qo'shnisi)
_react_assets = BASE_DIR.parent / 'frontend' / 'dist' / 'assets'
if _react_assets.exists():
    STATICFILES_DIRS.append(('react', _react_assets))

STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise — statik fayllarni siqib uzatadi (production, Render)
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'},
}

# ── Yuklangan fayllar uchun tashqi xotira (S3 / Cloudflare R2 / Backblaze B2) ──
# Render bepul tarifida disk vaqtinchalik — media/ har deploy'da o'chadi.
# AWS_STORAGE_BUCKET_NAME berilsa, fayllar bucket'ga yoziladi.
# Kalitlar: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (boto3 env'dan o'zi o'qiydi).
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL') or None
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME') or None
if AWS_STORAGE_BUCKET_NAME:
    STORAGES['default'] = {'BACKEND': 'storages.backends.s3.S3Storage'}
    AWS_S3_ENDPOINT_URL   = os.environ.get('AWS_S3_ENDPOINT_URL') or None   # R2: https://<id>.r2.cloudflarestorage.com
    AWS_S3_REGION_NAME    = os.environ.get('AWS_S3_REGION_NAME') or None    # R2: auto
    # Ochiq domen (R2 public bucket / CDN). Berilsa — doimiy ochiq URL'lar,
    # aks holda vaqtinchalik imzolangan URL'lar (1 soat).
    AWS_S3_CUSTOM_DOMAIN  = os.environ.get('AWS_S3_CUSTOM_DOMAIN') or None
    AWS_QUERYSTRING_AUTH  = not AWS_S3_CUSTOM_DOMAIN
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL       = None

# Production'da yuklangan fayllar tashqi xotiraga (S3/R2) yozilishi kerak. Aks holda
# ular Render diskiga tushadi va har deploy'da yo'qoladi.
if not DEBUG and not AWS_STORAGE_BUCKET_NAME:
    import warnings
    warnings.warn("AWS_STORAGE_BUCKET_NAME berilmagan: yuklangan fayllar vaqtinchalik diskka yoziladi.")

MEDIA_URL  = '/media/'
MEDIA_ROOT = Path(os.environ.get('MEDIA_ROOT', str(BASE_DIR / 'media')))
MEDIA_UPLOADS_PERSISTENT = bool(os.environ.get('MEDIA_ROOT'))
# Private research uses a separate non-public bucket or explicitly mounted disk.
PRIVATE_AWS_STORAGE_BUCKET_NAME = os.environ.get('PRIVATE_AWS_STORAGE_BUCKET_NAME', '')
PRIVATE_UPLOADS_ROOT = Path(os.environ.get('PRIVATE_UPLOADS_ROOT', str(BASE_DIR / 'private_uploads')))
PRIVATE_UPLOADS_PERSISTENT = bool(os.environ.get('PRIVATE_UPLOADS_ROOT'))
if PRIVATE_AWS_STORAGE_BUCKET_NAME and PRIVATE_AWS_STORAGE_BUCKET_NAME == AWS_STORAGE_BUCKET_NAME:
    raise ImproperlyConfigured('Ilmiy PDF uchun ochiq media bucketidan alohida yopiq bucket kerak.')
if PRIVATE_UPLOADS_PERSISTENT:
    _private_path, _public_path = PRIVATE_UPLOADS_ROOT.resolve(), MEDIA_ROOT.resolve()
    if _private_path == _public_path or _public_path in _private_path.parents:
        raise ImproperlyConfigured('Yopiq PDF papkasi ommaviy media papkasi ichida bo‘lmasin.')

REACT_BUILD_DIR = BASE_DIR.parent / 'frontend' / 'dist'

# Bosh sahifa (/) shu manzilga yo'naltiriladi: lokalda /app/, Render'da Vercel sayti
FRONTEND_URL = os.environ.get('FRONTEND_URL', '/app/')

# Fayl bo'lmagan so'rov tanasi chegarasi (matn maydonlari)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
# 2.5 MB dan katta fayllar RAM'da emas, vaqtinchalik faylda ushlanadi
# (Render bepul tarifida 512 MB xotira — katta yuklashlar serverni o'chirib qo'ymasin)
FILE_UPLOAD_MAX_MEMORY_SIZE = int(2.5 * 1024 * 1024)
FILE_UPLOAD_PERMISSIONS     = 0o644

ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'bmp'}
ALLOWED_DOC_EXTENSIONS   = {'pdf', 'doc', 'docx', 'odt', 'txt', 'rtf', 'xls', 'xlsx', 'ods', 'ppt', 'pptx'}
MAX_IMAGE_SIZE_MB = 20
MAX_DOC_SIZE_MB   = 100

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL          = '/django-admin/login/'
LOGIN_REDIRECT_URL = '/django-admin/'

# ── Kesh — konkordans va so'z chastotasi hisobini saqlaydi ───────────────────
# Bitta jarayon (gunicorn --workers 1) uchun yetarli. Ko'p jarayonli deploy'da Redis kerak.
CACHES = {
    'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache', 'LOCATION': 'korpus'},
}
if IS_VERCEL:
    CACHES['default'] = {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'korpus_cache',
    }
    # Serverless filesystem is read-only outside /tmp; this is temporary, not media storage.
    FILE_UPLOAD_TEMP_DIR = '/tmp'
    MEDIA_UPLOADS_PERSISTENT = False
    PRIVATE_UPLOADS_PERSISTENT = False
    STORAGES['staticfiles'] = {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}

# ── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    # korpus.pagination — ?page_size= parametrini qabul qiladi (maks. 200)
    'DEFAULT_PAGINATION_CLASS': 'korpus.pagination.StandardPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    # ?format=csv (eksport) DRF renderer sifatida qabul qilinib 404 bermasin
    'URL_FORMAT_OVERRIDE': None,
    # korpus.throttling — IP'ni X-Forwarded-For'dan emas, ishonchli sarlavhadan oladi
    'DEFAULT_THROTTLE_CLASSES': [
        'korpus.throttling.AnonRateThrottle',
        'korpus.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # SPA bir sahifada bir necha so'rov yuboradi — 100/hour oddiy foydalanuvchiga ham yetmasdi
        'anon':   '1000/hour',
        'user':   '5000/hour',
        'submit': '5/hour',    # taklif yuborish (SubmissionCreateView)
        'search': '120/hour',  # konkordans, so'z chastotasi (og'ir hisob-kitob)
        'export': '30/hour',   # butun korpusni eksport qilish
        'login':  '10/minute', # parol tanlab ko'rishdan himoya (token olish)
    },
}

# ── JWT ───────────────────────────────────────────────────────────────────────
from datetime import timedelta
SIMPLE_JWT = {
    # Qisqa umr: token o'g'irlansa ham oynasi kichik. Frontend 401 da refresh qiladi.
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':  True,
    # Rotatsiyadan keyin eski refresh token darhol bekor qilinadi (aks holda 30 kun ishlaydi)
    'BLACKLIST_AFTER_ROTATION': True,
}

# ── CORS (React dev server uchun) ─────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173 http://localhost:3000 http://127.0.0.1:5173'
).split()
CORS_ALLOW_CREDENTIALS = True
# Faqat shu loyihaning Vercel domenlari (production va preview'lar).
# Hamma *.vercel.app ga ruxsat berish — istalgan begona saytni ochib qo'yish edi.
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://turkiy-yozma-yodgorliklar(-[a-z0-9-]+)?\.vercel\.app$',
]

# ── Security ──────────────────────────────────────────────────────────────────
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS              = 'DENY'
REFERRER_POLICY              = 'strict-origin-when-cross-origin'
# React SPA (/app/) uchun Content-Security-Policy — XSS bo'lsa ham tokenlarni begona domenga
# yuborishni cheklaydi. Vercel'dagi nusxa frontend/vercel.json da.
CONTENT_SECURITY_POLICY = (
    "default-src 'self'; script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; "
    "connect-src 'self' https://*.onrender.com; object-src 'none'; base-uri 'self'; "
    "form-action 'self'; frame-ancestors 'none'"
)

SESSION_COOKIE_HTTPONLY      = True
SESSION_COOKIE_SAMESITE      = 'Lax'
SESSION_COOKIE_AGE           = 8 * 60 * 60
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'

# CSRF — ishonchli domenlar (Render + Vercel), env'dan probel bilan
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split() if o]
if _render_host:
    CSRF_TRUSTED_ORIGINS.append(f'https://{_render_host}')
CSRF_TRUSTED_ORIGINS.extend(f'https://{host}' for host in _vercel_hosts if host)

# ── Production xavfsizlik (faqat DEBUG=False bo'lganda) ───────────────────────
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # Render reverse-proxy
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND       = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST          = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT          = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS       = True
EMAIL_HOST_USER     = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL  = os.environ.get('DEFAULT_FROM_EMAIL', 'Turkiy Korpus <noreply@turkiy-korpus.uz>')
ADMIN_EMAIL         = os.environ.get('ADMIN_EMAIL', '')
