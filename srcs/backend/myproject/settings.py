
import os

from pathlib import Path
from channels.auth import AuthMiddlewareStack
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

AUTH_USER_MODEL = 'myapp.MyAppUser'
SESSION_COOKIE_AGE = 36000

SECRET_KEY = os.getenv('SECRET_KEY')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
DJANGO_ALLOW_ASYNC_UNSAFE = True
SIGNING_KEY = os.environ.get("JWT_SECRET_KEY")

if os.environ.get('DEBUG') in ['1', 'true']:
    DEBUG = True

PBKDF2_ITERATIONS = 180000  # Number of iterations (default is 180,000)
PBKDF2_SALT_LENGTH = 12     # Length of generated salt (default is 12)
PBKDF2_DIGEST = 'sha256'
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',  # Default PBKDF2 algorithm
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # Argon2 algorithm (recommended for newer projects)
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',  # BCrypt algorithm with SHA-256 hash
]

ALLOWED_HOSTS = [
    'localhost',
    '192.168.32.1',
    '169.254.131.21',
    '20.79.107.6',
    'pong42.azurewebsites.net',
    '127.0.0.1',
    'pong42.vercel.app',
    'four2trans-backend.onrender.com', 
    'localhost:3000',
    'c3r1p1.42vienna.com',
    'c3r1p5.42vienna.com',
    'c3r1p2.42vienna.com',
    'c3r1p3.42vienna.com',
    '10.13.1.5',
    '10.13.1.1',
    'localhost:5500',
    'localhost:8443',
    'localhost:443',
    'localhost:8000',
    'ehab42.vercel.app',
    '42transcendence.vercel.app',
    'eelasam.vercel.app',
    'ehab42.vercel.app:8443',
    '42transcendence.vercel.app:8443',
    'eelasam.vercel.app:8443',
    'localhost:8080',
    'api.intra.42.fr',
    'transcendence-beige.vercel.app',
    'backend',
    'frontend',
]



INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    #'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'myapp',
    'channels',
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
    #'whitenoise.middleware.WhiteNoiseMiddleware',

]

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('Bearer',),
    'SIGNING_KEY': SIGNING_KEY, 
    'ALGORITHM': 'HS256',
    'VERIFY_EXPIRATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ACCESS_TOKEN_LIFETIME': timedelta(days=60),

}

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
        'BACKEND': 'channels.layers.InMemoryChannelLayer', 
    },
}

# STATICFILES_FINDERS = [
#     'django.contrib.staticfiles.finders.FileSystemFinder',
#     'django.contrib.staticfiles.finders.AppDirectoriesFinder',
# ]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', BASE_DIR / 'db.sqlite3'),
        'USER': os.environ.get('POSTGRES_USER', 'user'),
        'PASSWORD': os.environ.get('PGPASSWORD', 'password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
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
        
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
        
    ),
}




LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Vienna'

USE_I18N = True

USE_TZ = True

CSRF_TRUSTED_ORIGINS = [
    'http://localhost',
    'https://localhost',
    'http://localhost:8443',
    'https://localhost:8443',
    'https://localhost:443',
    'https://10.13.1.1:8443',
    'https://10.13.1.2:8443',
    'https://10.13.1.3:8443',
    'https://10.13.1.4:8443',
    'https://10.13.1.5:8443',
    'https://10.13.1.5',
    'http://127.0.0.1',
    'https://127.0.0.1:8000',
    'https://127.0.0.1',
    'http://127.0.0.1:5500',
    'https://pong42.vercel.app',
    'https://ehab42.vercel.app',
    'https://42transcendence.vercel.app',
    'https://eelasam.vercel.app',
    'https://ehab42.vercel.app:8443',
    'https://42transcendence.vercel.app:8443',
    'https://eelasam.vercel.app:8443',
    'http://pong42.vercel.app',
    'http://pong42.azurewebsites.net',
    'https://pong42.azurewebsites.net',
    'http://localhost:3000',
    'http://localhost:5500',
    'https://transcendence-beige.vercel.app',
    'https://api.intra.42.fr',
    'https://c3r1p1.42vienna.com',
    'https://c3r1p3.42vienna.com',
    'https://c3r1p4.42vienna.com',
    'https://c3r1p5.42vienna.com',
    'https://c3r1p1.42vienna.com:8443',
    'https://c3r1p3.42vienna.com:8443',
    'https://c3r1p4.42vienna.com:8443',
    'https://c3r1p5.42vienna.com:8443',
    'https://192.168.32.1',
    'https://169.254.131.21',
    'https://20.79.107.6',
    'http://169.254.131.21',
    'http://20.79.107.6'
]

CORS_ALLOWED_ORIGINS = [
    'https://192.168.32.1',
    'http://localhost:8080',
    'http://localhost',
    'https://localhost',
    'http://localhost:8443',
    'https://localhost:8443',
    'https://localhost:443',
    'http://127.0.0.1',
    'https://127.0.0.1:8000',
    'https://127.0.0.1',
    'https://10.13.1.1:8443',
    'https://10.13.1.1',
    'https://10.13.1.2:8443',
    'https://10.13.1.3:8443',
    'https://10.13.1.4:8443',
    'https://10.13.1.5:8443',
    'https://10.13.1.5',
    'https://c3r1p1.42vienna.com',
    'https://c3r1p3.42vienna.com',
    'https://c3r1p4.42vienna.com',
    'https://c3r1p5.42vienna.com',
    'https://c3r1p1.42vienna.com:8443',
    'https://c3r1p3.42vienna.com:8443',
    'https://c3r1p4.42vienna.com:8443',
    'https://c3r1p5.42vienna.com:8443',
    'http://127.0.0.1:5500',
    'https://ehab42.vercel.app',
    'https://42transcendence.vercel.app',
    'https://eelasam.vercel.app',
    'https://ehab42.vercel.app:8443',
    'https://42transcendence.vercel.app:8443',
    'https://eelasam.vercel.app:8443',
    'https://pong42.vercel.app',
    'http://pong42.vercel.app',
    'http://pong42.azurewebsites.net',
    'https://pong42.azurewebsites.net',
    'http://localhost:3000',
    'http://localhost:5500',
    'https://transcendence-beige.vercel.app',
    'https://api.intra.42.fr',
    'https://169.254.131.21',
    'https://20.79.107.6',
    'http://169.254.131.21',
    'http://20.79.107.6'
]

CORS_ORIGIN_ALLOW_ALL = True


# STATIC_URL = '/static/'

# STATIC_ROOT = BASE_DIR / "staticfiles"
# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
# ]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CSRF_COOKIE_SECURE = False
APPEND_SLASH=False

