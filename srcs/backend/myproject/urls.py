
from django.contrib import admin
from django.urls import path
from myapp import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import re_path
from . import consumers
from django.conf import settings
from django.conf.urls.static import static


handler404 = 'myapp.views.custom_404'


urlpatterns = [
    path('ws/chatpage/', consumers.ChatConsumer.as_asgi()),
    path('ws/pingpong/', consumers.PingPongConsumer.as_asgi()),

    path('api/login/', views.login_view, name='api_login'),
    path('api/register/', views.register, name='api_register'),
    path('api/leaderboard/', views.leaderboard, name='api_leaderboard'),
    path('api/tournaments/', views.tournaments, name='api_tournaments'),
    path('api/get-csrf-token/', views.get_csrf_token, name='api_get_csrf_token'),
    path('api/fetch-messages/', views.fetch_messages, name='fetch_messages'),
    path('api/send-message/', views.send_message, name='send_message'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/proxyc/', views.proxy_viewc, name='proxy_viewc'),
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
    path('api/manage-profile/', views.manage_profile, name='manage_profile'),
    path('api/2fa-status', views.get_2fa_status, name='get_2fa_status'),
    path('api/2fa-activate', views.activate_2fa, name='activate_2fa'),
    path('api/2fa-qr-code', views.generate_qr_code, name='generate_qr_code'),
    path('api/2fa-deactivate', views.deactivate_2fa, name='deactivate_2fa'),
    path('api/check-2fa-code', views.check_2fa_code, name='check_2fa_code'),

    path('api/update-score', views.update_score, name='update_score'),
    path('api/get-online-users', views.get_online_users, name='get_online_users'),
    path('api/logout', views.logout_view, name='logout_view'),
    path('api/add-friend', views.add_friend, name='add_friend'),
    path('api/block-user', views.block_user, name='block_user'),
    path('api/unblock-user', views.unblock_user, name='unblock_user'),
    path('api/remove-friend', views.remove_friend, name='remove_friend'),
    path('api/friends', views.get_friends, name='get_friends'),
    path('api/save_tournament_data', views.save_tournament_data, name='save_tournament_data'),
    path('api/get_tournament_data', views.get_tournament_data, name='get_tournament_data'),
    path('api/fetch_achievements', views.fetch_achievements, name='fetch_achievements'),
    path('api/fetch_game_history', views.fetch_game_history, name='fetch_game_history'),
    path('api/get-blocked-users/', views.get_blocked_users, name='get_blocked_users'),


]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)