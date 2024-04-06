
import os

from pathlib import Path
from channels.auth import AuthMiddlewareStack

BASE_DIR = Path(__file__).resolve().parent.parent



SECRET_KEY = os.getenv('SECRET_KEY')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
REDIRECT_URI = os.environ.get("REDIRECT_URI")

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    'pong42.azurewebsites.net',
    '127.0.0.1',
    'pong42.vercel.app',
    'four2trans-backend.onrender.com', 
    'localhost:3000',
    'localhost:5500',
    'localhost:8443',
    'localhost:443',
    'localhost:8000',
    'localhost:8080',
    'api.intra.42.fr',
    'transcendence-beige.vercel.app',
    'psychic-journey-9q4rjvxwvwjf7579-443.app.github.dev/',
]


SOCKETIO_HOST = "0.0.0.0"
SOCKETIO_PORT = 8001

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'myapp',
    'channels',
    'socketio',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'myapp', 'templates')],
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

WSGI_APPLICATION = 'myproject.wsgi.application'
ASGI_APPLICATION = 'myproject.routing.application'
INTERACTIVE = False


CHANNEL_LAYERS = {
     'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer', # You can also use other backends like Redis
    },
}

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', BASE_DIR / 'db.sqlite3'),
        'USER': os.environ.get('POSTGRES_USER', 'user'),
        'PASSWORD': os.environ.get('PGPASSWORD', 'password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    },
    'chat': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'chat_db.sqlite3',
    }
}


X_FRAME_OPTIONS = 'ALLOWALL'

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

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        # Add additional authentication classes as needed
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
        # Add additional permission classes as needed
    ),
}




LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Vienna'

USE_I18N = True

USE_TZ = True


CSRF_TRUSTED_ORIGINS = ['http://localhost','https://localhost','http://localhost:8000','https://localhost:8443','https://localhost:443','https://psychic-journey-9q4rjvxwvwjf7579-8080.app.github.dev','https://psychic-journey-9q4rjvxwvwjf7579-8000.app.github.dev','https://psychic-journey-9q4rjvxwvwjf7579-443.app.github.dev','http://127.0.0.1','http://127.0.0.1:5500','https://pong42.vercel.app','http://pong42.vercel.app','http://pong42.azurewebsites.net','https://pong42.azurewebsites.net','http://localhost:8000','http://localhost:3000','http://localhost:5500','http://localhost','https://transcendence-beige.vercel.app','https://api.intra.42.fr']

CORS_ALLOWED_ORIGINS = ['http://localhost','https://localhost','http://localhost:8000','https://localhost:8443','https://localhost:443','https://psychic-journey-9q4rjvxwvwjf7579-8080.app.github.dev','https://psychic-journey-9q4rjvxwvwjf7579-8000.app.github.dev','https://psychic-journey-9q4rjvxwvwjf7579-443.app.github.dev','http://127.0.0.1','http://127.0.0.1:5500','https://pong42.vercel.app','http://pong42.vercel.app','http://localhost:8000','http://pong42.azurewebsites.net','https://pong42.azurewebsites.net','http://localhost:3000','http://localhost:5500','http://localhost','https://transcendence-beige.vercel.app','https://api.intra.42.fr']

CORS_ORIGIN_ALLOW_ALL = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CSRF_COOKIE_SECURE = False
APPEND_SLASH=False

