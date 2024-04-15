
from django.contrib import admin
from django.urls import path
from myapp import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import re_path
from . import consumers
from django.conf import settings
from django.conf.urls.static import static

#from socketio import views as socketio_views

handler404 = 'myapp.views.custom_404'


urlpatterns = [
    path('', views.home, name='home'),
    path('ws/chatpage/', consumers.ChatConsumer.as_asgi()),
    path('chatpage/', consumers.ChatConsumer.as_asgi()),
    path('ws/pingpong/', consumers.PingPongConsumer.as_asgi()),
    path('pingpong/', consumers.PingPongConsumer.as_asgi()),
    #path('admin/', admin.site.urls),
    path('login/', views.login_view, name='login'),
    path('ping/', views.login_view, name='ping'),
    path('register/', views.register, name='register'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('tournaments/', views.tournaments, name='tournaments'),
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
    path('fetch-messages/', views.fetch_messages, name='fetch_messages'),
    path('send-message/', views.send_message, name='send_message'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('proxyb/', views.proxy_viewb, name='proxy_viewb'),
    path('proxyc/', views.proxy_viewc, name='proxy_viewc'),
    path('signin42/', views.signin42, name='signin42'),
    path('signin42b/', views.signin42b, name='signin42b'),
    path('signin42c/', views.signin42c, name='signin42c'),
    path('messages', views.messages, name='messages'),
    path('get_all_users', views.get_all_users, name='get_all_users'),
    path('profiles/', views.get_profile_info, name='get_profile_info'),
    path('upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('get-email/', views.upload_avatar, name='get_email'),
    path('get-nickname/', views.get_nickname, name='get_nickname'),
    path('update-nickname/', views.update_nickname, name='update_nickname'),
    path('get-games/', views.update_nickname, name='get_games'),
    path('userinfo/', views.proxy_userinfo, name='proxy_userinfo'),
    path('update-player/', views.update_player_position, name='update_player_position'),
    path('game-state/', views.get_game_state, name='get_game_state'),
    path('check-player-waiting/<str:user_login>/', views.check_player_waiting, name='check_player_waiting'),
    path('feedback/', views.submit_feedback, name='submit_feedback'),
    path('show-feedbacks/', views.show_feedbacks, name='show_feedbacks'),


    
    path('api/login/', views.login_view, name='api_login'),
    path('api/ping/', views.login_view, name='api_ping'),
    path('api/register/', views.register, name='api_register'),
    path('api/leaderboard/', views.leaderboard, name='api_leaderboard'),
    path('api/tournaments/', views.tournaments, name='api_tournaments'),
    path('api/get-csrf-token/', views.get_csrf_token, name='api_get_csrf_token'),
    path('api/fetch-messages/', views.fetch_messages, name='fetch_messages'),
    path('api/send-message/', views.send_message, name='send_message'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/proxyb/', views.proxy_viewb, name='proxy_viewb'),
    path('api/proxyc/', views.proxy_viewc, name='proxy_viewc'),
    path('api/signin42/', views.signin42, name='signin42'),
    path('api/signin42b/', views.signin42b, name='signin42b'),
    path('api/signin42c/', views.signin42c, name='signin42c'),
    path('api/messages', views.messages, name='messages'),
    path('api/get_all_users', views.get_all_users, name='get_all_users'),
    path('api/profiles/', views.get_profile_info, name='get_profile_info'),
    path('api/upload-avatar/', views.upload_avatar, name='upload_avatar'),
    path('api/get-email/', views.upload_avatar, name='get_email'),
    path('api/get-nickname/', views.get_nickname, name='get_nickname'),
    path('api/update-nickname/', views.update_nickname, name='update_nickname'),
    path('api/get-games/', views.update_nickname, name='get_games'),
    path('api/userinfo/', views.proxy_userinfo, name='proxy_userinfo'),
    path('api/update-player/', views.update_player_position, name='update_player_position'),
    path('api/game-state/', views.get_game_state, name='get_game_state'),
    path('api/check-player-waiting/<str:user_login>/', views.check_player_waiting, name='check_player_waiting'),
    path('api/feedback/', views.submit_feedback, name='api_submit_feedback'),
    path('api/show-feedbacks/', views.show_feedbacks, name='show_feedbacks'),

]  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)