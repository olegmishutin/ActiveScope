import os
import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SERVER_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = SERVER_DIR.parent

SECRET_KEY = os.environ['SECRET_KEY'] if os.environ.get('DOCKERIZED') else os.getenv('SECRET_KEY')

DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ORIGIN_ALLOW_ALL = True

AUTH_USER_MODEL = 'auth_sys.User'

INSTALLED_APPS = [
    'daphne',
    'channels',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'auth_sys',
    'profiles',
    'groups',
    'messages',
    'projects'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'auth_sys.authentication.TokenAuthentication'
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer'
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema'
}

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'server.wsgi.application'
ASGI_APPLICATION = 'server.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DB_NAME'] if os.environ.get('DOCKERIZED') else os.getenv('DB_NAME'),
        'USER': os.environ['DB_USER'] if os.environ.get('DOCKERIZED') else os.getenv('DB_USER'),
        'PASSWORD': os.environ['DB_PASSWORD'] if os.environ.get('DOCKERIZED') else os.getenv('DB_PASSWORD'),
        'HOST': os.environ['DB_HOST'] if os.environ.get('DOCKERIZED') else os.getenv('DB_HOST'),
        'PORT': os.environ['DB_PORT'] if os.environ.get('DOCKERIZED') else os.getenv('DB_PORT')
    }
}

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

CELERY_BROKER_URL = f'redis://{"redis" if os.environ.get("DOCKERIZED") else "localhost"}:6379/0'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

CELERY_BEAT_SCHEDULE = {
    'task-name': {
        'task': 'messages.tasks.check_projects_tasks',
        'schedule': datetime.timedelta(minutes=30)
    },
}

EXPIRE_TOKEN_IN = datetime.timedelta(
    days=int(
        os.environ.get("EXPIRE_TOKEN_IN") if os.environ.get("DOCKERIZED") else os.getenv('EXPIRE_TOKEN_IN')
    )
)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis" if os.environ.get("DOCKERIZED") else "localhost", 6379)],
        },
    },
}

LANGUAGE_CODE = 'Ru-ru'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

MEDIA_URL = 'media/'
MEDIA_ROOT = PROJECT_DIR.parent / '/usr/src/media' if os.environ.get("DOCKERIZED") else SERVER_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
