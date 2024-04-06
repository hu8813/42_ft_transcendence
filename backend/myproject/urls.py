
from django.contrib import admin
from django.urls import path
from myapp import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import re_path
from . import consumers

#from socketio import views as socketio_views

handler404 = 'myapp.views.custom_404'


urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', admin.site.urls),
    path('login/', views.login_view, name='login'),
    path('ping/', views.login_view, name='ping'),
    path('register/', views.register, name='register'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('tournaments/', views.tournaments, name='tournaments'),
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('api/fetch-messages/', views.fetch_messages, name='fetch_messages'),
    path('api/send-message/', views.send_message, name='send_message'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/proxy/', views.proxy_view, name='proxy_view'),
    path('api/proxyb/', views.proxy_viewb, name='proxy_viewb'),
    path('api/proxyc/', views.proxy_viewc, name='proxy_viewc'),
    path('api/signin42/', views.signin42, name='signin42'),
    path('api/signin42b/', views.signin42b, name='signin42b'),
    path('api/signin42c/', views.signin42c, name='signin42c'),
    path('api/messages', views.messages, name='messages'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('get-email/', views.upload_avatar, name='get_email'),
    path('get-nickname/', views.get_nickname, name='get_nickname'),
    path('update-nickname/', views.update_nickname, name='update_nickname'),
    path('get-games/', views.update_nickname, name='get_games'),
    path('api/userinfo/', views.proxy_userinfo, name='proxy_userinfo'),
    path('update-player/', views.update_player_position, name='update_player_position'),
    path('game-state/', views.get_game_state, name='get_game_state'),
    path('check-player-waiting/<str:user_login>/', views.check_player_waiting, name='check_player_waiting'),
  
    #path("http://localhost:8001/socket.io/", socketio_views.SocketIOView.as_view(), name="socketio"),
]
