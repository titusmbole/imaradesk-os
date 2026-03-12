from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production-please')

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ["*"]
# =========================
# CORS CONFIGURATION
# =========================

CORS_ALLOW_CREDENTIALS = True

# Do NOT mix CORS_ALLOWED_ORIGINS with regex unless needed
CORS_ALLOWED_ORIGINS = []

# Allow all subdomains of imaradesk.com and localhost (dev)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.imaradesk\.com$",
    r"^http://.*\.localhost(:\d+)?$",
    r"^http://localhost(:\d+)?$",
]


# =========================
# CSRF CONFIGURATION
# =========================

# CSRF trusted origins - supports wildcards for subdomains
CSRF_TRUSTED_ORIGINS = [
    "https://imaradesk.com",
    "https://*.imaradesk.com",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://*.localhost:8000",  # Support all subdomains in dev
]

# Session and CSRF cookie settings
if DEBUG:
    # Development: Don't set cookie domain to allow localhost subdomains
    SESSION_COOKIE_DOMAIN = None
    CSRF_COOKIE_DOMAIN = None
    CSRF_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SAMESITE = 'Lax'
else:
    # Production: Use domain from config or default to .imaradesk.com
    SESSION_COOKIE_DOMAIN = config('SESSION_COOKIE_DOMAIN', default='.imaradesk.com')
    CSRF_COOKIE_DOMAIN = config('CSRF_COOKIE_DOMAIN', default='.imaradesk.com')
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SAMESITE = 'Lax'

# Session timeout settings
# Session expires after 10 minutes (600 seconds) of inactivity
SESSION_COOKIE_AGE = 1200  # 20 minutes in seconds
SESSION_SAVE_EVERY_REQUEST = True  # Refresh session on each request (resets timeout)
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Keep using cookie age instead of browser close

# Proxy SSL header for production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Primary domain for tenant fallback redirects
PRIMARY_DOMAIN = config('PRIMARY_DOMAIN', default='127.0.0.1:8000')
# Test

# For debug context processor
INTERNAL_IPS = ['127.0.0.1', 'localhost']

# Shared apps - available across all tenants
SHARED_APPS = [
    'django_tenants',
    'shared',
    'modules.crons',  # Centralized scheduled tasks (crons)
    'modules.email_to_ticket',  # Email to ticket - stores tenant help emails in public schema
    'modules.backoffice',  # Backoffice administration panel for managing tenants
    'corsheaders',
    'django_celery_beat',  # Celery Beat scheduler
    'django_celery_results',  # Celery task results
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',  # Required for email notifications
]

SITE_ID = 1

# Tenant-specific apps - each tenant gets their own isolated data
TENANT_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'inertia',
    # Core modules
    'modules.core',
    'modules.tickets',
    'modules.tasks',
    'modules.people',
    'modules.integrations',
    'modules.assets',
    # Data modules
    'modules.users',
    'modules.kb',
    'modules.settings',
    'modules.ticket',
    'modules.sla',
    'modules.customer_portal',
    'modules.website',
    'modules.surveys',
]

INSTALLED_APPS = list(set(SHARED_APPS + TENANT_APPS))

# Tenant configuration
TENANT_MODEL = "shared.Client" 
TENANT_DOMAIN_MODEL = "shared.Domain" 

MIDDLEWARE = [
    'shared.middlewares.TenantMiddleware.CustomTenantMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'shared.middlewares.CsrfMiddleware.InertiaCSRFMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'inertia.middleware.InertiaMiddleware',
    'shared.middlewares.InertiaMiddleware.inertia_share',
]

ROOT_URLCONF = 'config.urls'

# Tenant routing
PUBLIC_SCHEMA_URLCONF = 'config.urls_public'  # For public schema (marketing site)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.template.context_processors.csrf',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

DATABASE_ROUTERS = (
    'django_tenants.routers.TenantSyncRouter',
)

# =========================
# CACHE CONFIGURATION
# =========================
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,  # 5 minutes default timeout
        'OPTIONS': {
            'MAX_ENTRIES': 1000
        }
    }
}

# Cache key prefixes
VIEWS_CACHE_TIMEOUT = 300  # 5 minutes for ticket views

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Only add frontend dist if it exists
FRONTEND_DIST = BASE_DIR / 'frontend' / 'dist'
STATIC_DIR = BASE_DIR / 'static'

STATICFILES_DIRS = []
if FRONTEND_DIST.exists():
    STATICFILES_DIRS.append(FRONTEND_DIST)
if STATIC_DIR.exists():
    STATICFILES_DIRS.append(STATIC_DIR)

# Media files (uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# WhiteNoise configuration - only use manifest storage in production
if not DEBUG:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Inertia configuration
INERTIA_LAYOUT = 'base.html'
INERTIA_SSR_ENABLED = False

# Login settings
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/'

# CSRF trusted origins (for custom domains / HTTPS behind proxy)
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='',
    cast=lambda v: [s.strip() for s in v.split(',')] if v else []
)

# CSRF settings for JavaScript/AJAX
CSRF_COOKIE_HTTPONLY = False  # Allow JavaScript to read CSRF cookie
CSRF_USE_SESSIONS = False  # Use cookie-based CSRF tokens
CSRF_COOKIE_SAMESITE = 'Lax'

# Logging configuration
# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#             'formatter': 'verbose',
#         },
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'DEBUG',  # Changed to DEBUG
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console'],
#             'level': 'INFO',
#             'propagate': False,
#         },
#         'django.request': {
#             'handlers': ['console'],
#             'level': 'DEBUG',  # Changed to DEBUG to see full errors
#             'propagate': False,
#         },
#         'django_tenants': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#             'propagate': False,
#         },
#     },
# }


# Email hosting
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_USE_SSL = config('EMAIL_USE_SSL', cast=bool)
EMAIL_USE_TLS = False
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL')
DEFAULT_FROM_NAME = config('DEFAULT_FROM_NAME')

# Email HELP settings (for email-to-ticket functionality)
# Note: SMTP port (465) is for sending, IMAP port (993) is for reading
EMAIL_HELP_HOST = config('EMAIL_HELP_HOST', default='')
EMAIL_HELP_PORT = config('EMAIL_HELP_PORT', default=465, cast=int)  # SMTP port for sending
EMAIL_HELP_IMAP_PORT = config('EMAIL_HELP_IMAP_PORT', default=993, cast=int)  # IMAP port for reading
EMAIL_HELP_USE_SSL = config('EMAIL_HELP_USE_SSL', default=True, cast=bool)
EMAIL_HELP_HOST_USER = config('EMAIL_HELP_HOST_USER', default='')
EMAIL_HELP_HOST_PASSWORD = config('EMAIL_HELP_HOST_PASSWORD', default='')
DEFAULT_HELP_FROM_EMAIL = config('DEFAULT_HELP_FROM_EMAIL', default='')
DEFAULT_HELP_FROM_NAME = config('DEFAULT_HELP_FROM_NAME', default='ImaraDesk Help')

# Slack Integration Settings
SLACK_CLIENT_ID = config('SLACK_CLIENT_ID')
SLACK_OAUTH_SCOPES = config('SLACK_OAUTH_SCOPES')
SLACK_REDIRECT_URI = config('SLACK_REDIRECT_URI')
SLACK_CLIENT_SECRET = config('SLACK_CLIENT_SECRET')

# Teams Integration Settings
TEAMS_APPLICATION_ID = config('TEAMS_APPLICATION_ID', default='')
TEAMS_DIRECTORY_ID = config('TEAMS_DIRECTORY_ID', default='')
TEAMS_CLIENT_SECRET = config('TEAMS_CLIENT_SECRET', default='')
TEAMS_REDIRECT_URI = config('TEAMS_REDIRECT_URI', default='')

# Alias for consistency with OAuth naming conventions
TEAMS_CLIENT_ID = TEAMS_APPLICATION_ID

# Microsoft Graph API scopes for Teams
TEAMS_OAUTH_SCOPES = [
    'User.Read',
    'Team.ReadBasic.All',
    'Channel.ReadBasic.All', 
    'ChannelMessage.Send',
    'offline_access', 
]

# Outlook Mail Integration Settings (reuses Teams Azure AD app)
OUTLOOK_REDIRECT_URI = config('OUTLOOK_REDIRECT_URI', default='')

# Microsoft Graph API scopes for Outlook Mail
OUTLOOK_OAUTH_SCOPES = [
    'User.Read',
    'Mail.Read',
    'Mail.ReadWrite',
    'offline_access',
]

# =========================
# CELERY CONFIGURATION
# =========================

# Redis as message broker
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')

# Celery settings
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 300  # 5 minutes max per task
CELERY_WORKER_HIJACK_ROOT_LOGGER = False

# Store task results in Django database
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'default'

# Email processing settings
EMAIL_PROCESSING_THREADS = config('EMAIL_PROCESSING_THREADS', default=4, cast=int)
EMAIL_POLL_INTERVAL = config('EMAIL_POLL_INTERVAL', default=10, cast=int)  # seconds

# =========================
# SSL CONFIGURATION (Cloudflare Origin Certificates)
# =========================
SSL_CERTIFICATE_PATH = config('SSL_CERTIFICATE_PATH', default='/etc/ssl/cloudflare/cert.pem')
SSL_PRIVATE_KEY_PATH = config('SSL_PRIVATE_KEY_PATH', default='/etc/ssl/cloudflare/key.pem')


# CloudFlare
CLOUDFLARE_API_TOKEN = config('CLOUDFLARE_API_TOKEN', default='')
CLOUDFLARE_ACCOUNT_ID = config('CLOUDFLARE_ACCOUNT_ID', default='')
CLOUDFLARE_ZONE_ID = config('CLOUDFLARE_ZONE_ID', default='')
