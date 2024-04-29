from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.authtoken.models import Token
from django.conf import settings
import requests
import uuid
import os
import json
from .models import Tournament, MyAppUser, Player, WaitingPlayer, Message, UserProfile, Feedback, Achievement, MyAppUserGroups, MyAppUserPermissions, Channel, GameStats
from django.utils import timezone
from django.db import IntegrityError
from django.utils.html import escape
import re
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework_simplejwt.tokens import AccessToken
import jwt
from rest_framework import status
import qrcode
import pyotp
from django.core.files.storage import default_storage
from io import BytesIO
from django.middleware.csrf import get_token
from django.contrib.sessions.models import Session
from datetime import timedelta
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.sessions.backends.db import SessionStore
from urllib.parse import quote
from django.db import IntegrityError
from django.core.paginator import Paginator


token_obtain_pair_view = TokenObtainPairView.as_view()
token_refresh_view = TokenRefreshView.as_view()


def is_valid_username(username):
    """
    Validates the username according to the given criteria:
    - Length is not greater than 50 characters
    - Contains only alphanumeric characters, underscores, and hyphens
    """
    if len(username) > 50:
        return False
    if not re.match(r'^[a-zA-Z0-9_-]+$', username):
        return False
    return True

def create_channel(name, owner, password=None):
    channel = Channel.objects.create(name=name, owner=owner, password=password)
    return channel

def get_channels():
    channels = Channel.objects.all()
    return channels

def check_channel_password(channel_id, password):
    try:
        channel = Channel.objects.get(id=channel_id)
        return channel.password == password
    except Channel.DoesNotExist:
        return False

def kick_or_block_user(channel_id, user_to_kick_or_block):
    try:
        channel = Channel.objects.get(id=channel_id)
        if user_to_kick_or_block == channel.owner:
            return False  
        if user_to_kick_or_block == channel.moderator:
            channel.moderator = None  
            channel.save()
        return True
    except Channel.DoesNotExist:
        return False

def remove_friend(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        user_requester = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        friend = MyAppUser.objects.get(username=username)
        
        if friend == user_requester:
            return JsonResponse({'message': "You cannot remove yourself as a friend."}, status=400)
        
        if friend not in user_requester.friends.all():
            return JsonResponse({'message': f"{friend.username} is not your friend."}, status=400)
        
        user_requester.friends.remove(friend)
        user_requester.save()
        
        return JsonResponse({'message': f"{friend.username} removed from friends successfully."})
    
    except MyAppUser.DoesNotExist:
        return JsonResponse({'message': "Friend not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=401)


def add_friend(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        friend = MyAppUser.objects.get(username=username)
        
        if friend == user_requester:
            return JsonResponse({'message': "You cannot add yourself as a friend."}, status=400)
        
        if friend in user_requester.friends.all():
            return JsonResponse({'message': f"{friend.username} is already your friend."}, status=400)
        
        user_requester.friends.add(friend)
        user_requester.save()
        
        return JsonResponse({'message': f"{friend.username} added as a friend successfully."})
    
    except MyAppUser.DoesNotExist:
        return JsonResponse({'message': "Friend not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=401)

def get_blocked_users(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        user_requester = MyAppUser.objects.get(pk=user_id)
        
        blocked_users = user_requester.blocked_users.all()
        
        blocked_usernames = [user.nickname for user in blocked_users]
        
        return JsonResponse({'blocked_users': blocked_usernames})
    
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=400)
    
def unblock_user(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        user_to_unblock = MyAppUser.objects.get(username=username)
        
        if user_to_unblock == user_requester:
            return JsonResponse({'message': "You cannot unblock yourself."}, status=400)
        
        if user_to_unblock not in user_requester.blocked_users.all():
            return JsonResponse({'message': f"{user_to_unblock.username} is not blocked."}, status=400)
        
        user_requester.blocked_users.remove(user_to_unblock)
        user_requester.save()
        
        return JsonResponse({'message': f"{user_to_unblock.username} unblocked successfully."})
    
    except MyAppUser.DoesNotExist:
        return JsonResponse({'message': "User to unblock not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=401)

def block_user(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        user_to_block = MyAppUser.objects.get(username=username)
        
        if user_to_block == user_requester:
            return JsonResponse({'message': "You cannot block yourself."}, status=400)
        
        if user_to_block in user_requester.blocked_users.all():
            return JsonResponse({'message': f"{user_to_block.username} is already blocked."}, status=400)
        
        user_requester.blocked_users.add(user_to_block)
        user_requester.save()
        
        return JsonResponse({'message': f"{user_to_block.username} blocked successfully."})
    
    except MyAppUser.DoesNotExist:
        return JsonResponse({'message': "User to block not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=401)

def fetch_game_history(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        username = request.GET.get('username')
        
        if username and is_valid_username(username):
            user = MyAppUser.objects.get(username=username)
            user_id = user.id
        else:
            user = MyAppUser.objects.get(id=user_id)

        game_history = Achievement.objects.filter(user_id=user_id)

        game_history_data = []
        for achievement in game_history:
            game_history_data.append({
                'opponent': achievement.opponent,
                'game_type': achievement.game_type,
                'tournaments_won': achievement.tournaments_won,
                'date_time_played': achievement.date_time_played.strftime('%Y-%m-%d %H:%M:%S')  # Convert to string
            })

        return JsonResponse(game_history_data, safe=False)  # Set safe=False to allow serialization of lists
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT token expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except KeyError:
        return JsonResponse({'error': 'User ID not found in token'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def fetch_achievements(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        achievements = Achievement.objects.filter(user_id=user_id).first()

        if not achievements:
            return JsonResponse({'error': 'Achievements not found'}, status=200)

        data = {
            'games_played': achievements.games_played,
            'games_won': achievements.games_won,
            'games_lost': achievements.games_lost,
            'winning_rate': round((achievements.games_won / achievements.games_played) * 100, 2) if achievements.games_played > 0 else 0,
        }

        return JsonResponse(data)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT token expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except KeyError:
        return JsonResponse({'error': 'User ID not found in token'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def logout_view(request):

    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')

        if user_id is None or user_id == '':
            user_id = request.session.get('user_id')

        if user_id is None or user_id == '':
            request.session.flush()
            return JsonResponse({'success': 'Logged out successfully'})

        try:
            user = MyAppUser.objects.get(id=user_id)
            user.is_online = False
            user.save()
        except MyAppUser.DoesNotExist:
            pass

        active_sessions = Session.objects.all()
        for session in active_sessions:
            decoded_data = session.get_decoded()
            session_user_id = decoded_data.get('_auth_user_id')
            if session_user_id == str(user_id):
                session.delete()


        request.session.flush()

        return JsonResponse({'success': 'Logged out successfully'})
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

def get_friends(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        user = MyAppUser.objects.get(pk=user_id)
        
        requested_username = request.GET.get('username')
        if requested_username:
            if len(requested_username) > 50 or not is_valid_username(requested_username):
                return JsonResponse({'error': 'Invalid username format'}, status=400)
            requested_user = MyAppUser.objects.get(username=requested_username)
            friends = requested_user.friends.all()
        else:
            friends = user.friends.all()
        
        # Get online user IDs
        time_threshold = timezone.now() - timedelta(seconds=settings.SESSION_COOKIE_AGE) + timedelta(minutes=42)
        active_sessions = Session.objects.filter(expire_date__gte=time_threshold)
        online_user_ids = {str(session.get_decoded().get('_auth_user_id')) for session in active_sessions}

        friend_list = []
        for friend in friends:
            is_online = str(friend.id) in online_user_ids and friend.is_online
            friend_info = {
                'username': friend.username,
                'nickname': friend.nickname,
                'image_link': friend.image_link,
                'status': 'online' if is_online else 'offline'
            }
            friend_list.append(friend_info)
        
        return JsonResponse({'friends': friend_list})
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT token expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def get_online_users(request):
    try:
        time_threshold = timezone.now() - timedelta(seconds=settings.SESSION_COOKIE_AGE) + timedelta(minutes=42)

        active_sessions = Session.objects.filter(expire_date__gte=time_threshold)

        online_users = MyAppUser.objects.filter(is_online=True)

        online_users_data = []
        for user in online_users:
            has_active_session = any(session.get_decoded().get('_auth_user_id') == str(user.id) for session in active_sessions)
            
            if not has_active_session:
                user.is_online = False
                user.save()
                continue
            
            online_users_data.append({
                'username': user.username,
                'nickname': user.nickname,
                'image_link': user.image_link if hasattr(user, 'image_link') else None
            })

        if not online_users_data:
            return JsonResponse({'online_users': []})  

        return JsonResponse({'online_users': online_users_data})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
def get_all_users(request):
    try:
        all_users = MyAppUser.objects.values_list('username', flat=True)
        return JsonResponse(list(all_users), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)



def submit_feedback(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            feedback_text = data.get('feedback')

            feedback = Feedback.objects.create(feedback_text=feedback_text)
            return JsonResponse({'message': 'Feedback submitted successfully'}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except IntegrityError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'An unexpected error occurred', 'details': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)



def show_feedbacks(request):
    if request.method == 'GET':
        try:
            feedbacks = Feedback.objects.all()

            feedback_list = [{'id': feedback.id, 'text': feedback.feedback_text, 'created_at': feedback.created_at} for feedback in feedbacks]

            return JsonResponse({'feedbacks': feedback_list}, status=200)
        except Exception as e:
            return JsonResponse({'error': 'An unexpected error occurred', 'details': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


def messages(request):
    if request.method == 'GET':
        try:
            messages = list(Message.objects.order_by('created_at')[:50].values())
            return JsonResponse(messages, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
        try:
            name = escape(data.get('name', ''))
            text = escape(data.get('text', ''))
            recipient = escape(data.get('recipient', ''))
            csrf_token = get_token(request) 

            message = Message.objects.create(name=name, text=text, recipient=recipient)
            
            message_data = {
                'id': message.id,
                'name': message.name,
                'text': message.text,
                'recipient': message.recipient,
                'created_at': timezone.localtime(message.created_at).timestamp(),
                'csrfToken': csrf_token,
            }
            return JsonResponse(message_data)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def chat(request):
    return JsonResponse({'error': str(e)}, status=404)

def get_profile_info(request):
    try:
        username = request.GET.get('username')
        
        if not username or not is_valid_username(username):
            return JsonResponse({'error': 'Username parameter is missing'}, status=400)
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        
        try:
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user_requester = MyAppUser.objects.get(pk=user_id)
            user = MyAppUser.objects.get(username=username)
            csrf_token = get_token(request)
            if user_id and 'user_id' not in request.session:
                request.session['user_id'] = user_id
            is_online = user.is_online
            user_id = user.id
            # if is_online:
            #     active_sessions = Session.objects.filter(expire_date__gte=timezone.now(), _auth_user_id=user_id)
            #     if not active_sessions.exists():
            #         is_online = False
            
            # Query achievements for the user
            achievements = Achievement.objects.filter(user_id=user.id).first()

            # Calculate winning rate
            games_played = user.games_played
            games_won = user.games_won
            games_lost = user.games_lost
            winning_rate = round((games_won / games_played) * 100, 2) if games_played > 0 else 0
            
            user_info = {
                'nickname': user.nickname,
                'login': user.username,
                'score': user.score,
                'image_link': user.image_link,
                'csrfToken': csrf_token,
                'is_online': is_online,
                'games_played': games_played,
                'games_won': games_won,
                'games_lost': games_lost,
                'winning_rate': winning_rate
            }
            
            return JsonResponse({'user': user_info})
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except MyAppUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def signin42c(request):
    try:
        client_id = os.getenv('CLIENT_ID')

        referral_url = request.GET.get('referral_url')
        
        if referral_url:
            request.session['referral_url'] = referral_url
            referral_url = quote(referral_url)  
        
        authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&response_type=code&redirect_uri={referral_url}/api/proxyc/'
        
        return HttpResponseRedirect(authorization_url)
    
    except Exception as e:
        return HttpResponseRedirect(referral_url or '/') 

def proxy_userinfo(request):
 
    try:
        jwt_token = request.headers.get('Authorization')
        if not jwt_token:
            return JsonResponse({'error': 'JWT token is missing'}, status=401)

        jwt_authentication = JWTAuthentication()
        authentication_result = jwt_authentication.authenticate(request)
        #print(authentication_result)  

        authenticated_user, _ = authentication_result
        csrf_token = get_token(request)
        
        if authenticated_user is None:
           return JsonResponse({'error': 'Invalid or expired JWT token'}, status=401)
        authenticated_user2 = MyAppUser.objects.get(id=authentication_result[1]['user_id'])
        
        #print(authentication_result[1]['user_id'])
        session = SessionStore()
        session['user_id'] = authenticated_user2.id
        session.create()
        login(request, authenticated_user)
        
        user_info = {
            'nickname': authenticated_user2.nickname,
            'login': authenticated_user2.username,
            'image_link': authenticated_user2.image_link,
            'score': authenticated_user2.score,
            'email': authenticated_user2.email,
            'csrfToken': csrf_token,
            'is_oauth_user': authenticated_user2.is_oauth_user,
            'two_factor_enabled': authenticated_user2.two_factor_enabled
        }
        return JsonResponse({'user': user_info})
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
def proxy_viewc(request):
    try:
        code = request.GET.get('code')
        if not code:
            return JsonResponse({'error': 'Code parameter is missing'}, status=400)
        if len(code) != 64 or not re.match(r'^[a-zA-Z0-9]+$', code):
            return JsonResponse({'error': 'Invalid code format'}, status=400)
        client_id = os.getenv('CLIENT_ID')
        client_secret = os.getenv('CLIENT_SECRET')
        redirect_uri = request.session.get('referral_url')+'/api/proxyc/'
        #print(redirect_uri)
        csrf_token = get_token(request)

        if not client_id or not client_secret or not redirect_uri:
            return JsonResponse({'error': 'Environment variables are not set correctly'}, status=400)

        data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
            'csrfToken': csrf_token,
        }

        try:
            response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
            response.raise_for_status()

            access_token = response.json().get('access_token')

            user_data_response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
            user_data_response.raise_for_status()

            user_data = user_data_response.json()
            login = user_data.get('login')
            email = user_data.get('email')
            image_data = user_data.get('image', {})
            image_link = image_data.get('versions', {}).get('medium', image_data.get('link'))

            
            try:
                user = MyAppUser.objects.get(username=login)
                if not user.is_oauth_user: 
                    redirect_url = f'/#login?m=oauth'
                    return redirect(redirect_url)
            except MyAppUser.DoesNotExist:
                try:
                    user = MyAppUser.objects.get(email=email)
                    if not user.is_oauth_user: 
                        redirect_url = f'/#login?m=oauth'
                        return redirect(redirect_url)
                except MyAppUser.DoesNotExist:
                    user = MyAppUser.objects.create_user(username=login, email=email)
                    user.nickname = user_data.get('nickname', user.username)
                    user.image_link = image_link
                    user.is_oauth_user = True
                    user.save()

            user.is_online = True
            user.save()
            token = AccessToken.for_user(user)
            encoded_token = str(token)
            redirect_url = f'/return.html?jwtToken={encoded_token}'

            return redirect(redirect_url)
        except requests.RequestException as e:
            return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@api_view(['POST'])
def obtain_token(request):
    if request.method == 'POST':
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            user = MyAppUser.objects.filter(username=username).first()
            if user is not None and user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key})
            else:
                return Response({'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


def get_email(request):
    try:
        user = request.user  
        if user.is_authenticated:
            email = user.email
            return JsonResponse({'email': email})
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def get_nickname(request):
    try:
        user = request.user
        if user.is_authenticated:
            nickname = user.nickname  
            return JsonResponse({'nickname': nickname})
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def update_nickname(request):
    if request.method == 'POST' and 'nickname' in request.POST:
        try:
            new_nickname = request.POST.get('nickname')
            user = MyAppUser.objects.filter(nickname=new_nickname).first()
            if user is not None:
                return JsonResponse({'error': 'Nickname is already used'}, status=400)
            
            if new_nickname:
                if not re.match(r'^[a-zA-Z0-9_-]+$', new_nickname):
                    return JsonResponse({'error': 'Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.'}, status=400)
                request.user.nickname = new_nickname
                request.user.save()
                return JsonResponse({'message': 'Profile information updated successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


@api_view(['POST'])
def upload_avatar(request):
    try:
        
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        try:
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = MyAppUser.objects.get(pk=user_id)
            if user_id and 'user_id' not in request.session:
                request.session['user_id'] = user_id
        except jwt.ExpiredSignatureError:
            return Response({"message": "JWT token has expired."}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"message": "Invalid JWT token."}, status=status.HTTP_401_UNAUTHORIZED)
        except MyAppUser.DoesNotExist:
            return Response({"message": "User does not exist."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == 'POST' and request.FILES.get('image'):
            avatar_file = request.FILES['image']

            
            if not avatar_file.content_type.startswith('image'):
                return Response({"message": "Only image files (PNG, JPG, JPEG, GIF) are allowed."}, status=status.HTTP_400_BAD_REQUEST)
            
            if avatar_file.size > 5 * 1024 * 1024:  
                return Response({"message": "File size exceeds the limit of 5 MB."}, status=status.HTTP_400_BAD_REQUEST)

            unique_filename = str(uuid.uuid4()) + avatar_file.name[avatar_file.name.rfind('.'):]

            
            file_path = default_storage.save(unique_filename, avatar_file)

            
            user.image_link = "/media/" + file_path
            user.save()
            #print(user.image_link)

            return Response({"message": "Avatar uploaded successfully.", "image_link": user.image_link})
        else:
            return Response({"message": "No avatar file provided."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        #print(f"An error occurred: {str(e)}")
        return Response({"message": "An error occurred while uploading the avatar."}, status=401)
        
def update_score(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        result = request.GET.get('result') 
        opponent = request.GET.get('opponent')
        if not opponent:
            opponent = 'cpu'
        gametype = request.GET.get('gametype')

        if result == 'win':
            user.games_won = user.games_won + 1
            user.score = user.score + 2
        elif result == 'lost':
            user.games_lost = user.games_lost + 1
            user.score = user.score - 1 
            if user.score < 0:
                user.score = 0  
        user.games_played = user.games_played + 1
        user.save()

        Achievement.objects.create(
            user=user,
            games_played=user.games_played,
            games_won=user.games_won,
            games_lost=user.games_lost,
            tournaments_won=1 if result == 'win' else 0,
            date_time_played=timezone.now(),
            game_type=gametype,
            opponent=opponent
        )

        return JsonResponse({'message': 'Score and game history updated successfully'})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT signature has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def get_score(request):
    try:
        users = MyAppUser.objects.all()
        user_data = serialize('json', users)
        score = 100  
        response_data = {
            'score': score,
            'users': user_data
        }
        return JsonResponse(response_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def ping(request):
    return JsonResponse({'message': 'Server is awake!'})


def get_games(request):
    return JsonResponse({'message': 'Server is awake!'})



def tournaments(request):
    pass
    #tournaments = Tournament.objects.all()
    #serializer = TournamentSerializer(tournaments, many=True)
    #return JsonResponse(serializer.data, safe=False)


def leaderboard(request):
    
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        leaderboard_users = MyAppUser.objects.order_by('-score')[:100]  

        leaderboard_data = []
        for user in leaderboard_users:
            total_games_played = user.games_played
            total_games_won = user.games_won

            winning_rate = 0
            if total_games_played > 0:
                winning_rate = (total_games_won / total_games_played) * 100

            user_data = {
                'username': user.username,
                'nickname': user.nickname,
                'date_joined': user.date_joined,
                'image_link': user.image_link,
                'score': user.score,
                'is_online': user.is_authenticated,
                'winning_rate': round(winning_rate/100, 2)
            }
            leaderboard_data.append(user_data)
        
        return JsonResponse(leaderboard_data, safe=False, status=200)
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def fetch_messages(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)("chat_group", {"type": "fetch_messages"})
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def send_message(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        message_data = json.loads(request.body)
        message = message_data['message']
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)("chat_group", {"type": "send_message", "message": message})
        return JsonResponse({'status': 'success'})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except KeyError:
        return JsonResponse({'error': 'Missing required field "message"'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@ensure_csrf_cookie
def get_csrf_token(request):
    try:
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def register(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            if not all([username, email, password, confirm_password]):
                return JsonResponse({"error": "All fields are required."}, status=400)

            if len(username) > 50 or not is_valid_username(username):
                return JsonResponse({"error": "Username can only contain alphanumeric characters, underscores, and hyphens. Max. 50chars."}, status=400)

            if not re.match(r'^[\w\.-]+@[\w\.-]+$', email):
                return JsonResponse({"error": "Invalid email format. Please enter a valid email address."}, status=400)

            if len(password) < 8:
                return JsonResponse({"error": "Password must be at least 8 characters long."}, status=400)

            if not any(char.isdigit() for char in password):
                return JsonResponse({"error": "Password must contain at least one digit."}, status=400)

            if not any(char.isupper() for char in password):
                return JsonResponse({"error": "Password must contain at least one uppercase letter."}, status=400)

            if not all(char.isalnum() or char in ['_', '-'] for char in username):
                return JsonResponse({"error": "Username can only contain alphanumeric characters, underscores, and hyphens."}, status=400)

            if MyAppUser.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already exists. Please choose a different username."}, status=400)

            if MyAppUser.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already exists. Please use a different email address."}, status=400)

            if password != confirm_password:
                return JsonResponse({"error": "Passwords do not match. Please make sure your passwords match."}, status=400)

            user = MyAppUser.objects.create_user(username=username, email=email, password=password, score=0)
            user.nickname = username
            user.is_oauth_user = False
            user.save()
            
            return JsonResponse({"message": "Registration successful. You can now log in."}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred while registering. Please try again later."}, status=400)

    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

def login_view(request):
    try:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')
            if not all([username, password]):
                return JsonResponse({"error": "All fields are required."}, status=400)
            if len(username) > 50 or not is_valid_username(username):
                return JsonResponse({'error': 'Invalid username format'}, status=400)
            
            user = authenticate(username=username, password=password)
            if user is not None:
                user = MyAppUser.objects.get(username=username)
                login(request, user)
                user.is_online = True
                user.save()  # Save the user instance to persist the changes
                token = AccessToken.for_user(user)
                session = SessionStore()
                session['user_id'] = user.id
                session.create()
                encoded_token = str(token)
                csrf_token = get_token(request)
                user_info = {
                    'message': 'Login successful',
                    'jwt_token': encoded_token,
                    'userNickname': getattr(user, 'nickname', 'unknown'),
                    'image_link': getattr(user, 'image_link', ''),
                    'score': getattr(user, 'score', '0'),
                    'email': getattr(user, 'email', 'unknown'),
                    'userLogin': getattr(user, 'username', 'unknown'),
                    'jwt_token': encoded_token,
                    'csrfToken': csrf_token,
                }
                return JsonResponse(user_info, status=200)
            else:
                return JsonResponse({'error': 'Invalid login credentials'}, status=400)
        else:
            return JsonResponse({'error': 'Unknown method'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def update_player_position(request):
    if request.method == 'POST':
        try:
            player_id = request.POST.get('player_id')
            position_x = request.POST.get('position_x')
            position_y = request.POST.get('position_y')

            # Validate input
            if not player_id or not position_x or not position_y:
                return JsonResponse({'success': False, 'error': 'Missing required fields'})

            # Check if player exists
            player = Player.objects.filter(id=player_id).first()
            if not player:
                return JsonResponse({'success': False, 'error': 'Player not found'})

            # Update player position
            player.position_x = position_x
            player.position_y = position_y
            player.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    return JsonResponse({'success': False, 'error': 'Invalid HTTP method'})

def get_game_state(request):
    try:
        players = Player.objects.all()
        game_state = [{'id': player.id, 'name': player.name, 'position_x': player.position_x, 'position_y': player.position_y} for player in players]
        return JsonResponse({'game_state': game_state})
    except Exception as e:
        return JsonResponse({'error': str(e)})


def home(request):
    return render(request, '404.html', status=404)

def custom_404(request, exception):
    return render(request, '404.html', status=404)

def check_player_waiting(request, user_login):
    global waiting_queue

    try:
        if waiting_queue:
            matched_user = waiting_queue.pop(0)
            return JsonResponse({'waiting': True, 'matched_user': matched_user, 'current_user': user_login})
        else:
            waiting_queue.append(user_login)
            return JsonResponse({'waiting': False})
    except Exception as e:
        return JsonResponse({'error': str(e)})


def cancel_waiting(request, user_login):
    global waiting_queue

    try:
        waiting_queue = [player for player in waiting_queue if player != user_login]
        return JsonResponse({'message': f'User {user_login} removed from waiting queue'})
    except Exception as e:
        return JsonResponse({'error': str(e)})


def manage_profile(request):
    
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = MyAppUser.objects.get(pk=user_id)
        csrf_token = get_token(request)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        if request.method == 'GET':
            user_info = {
                'userNickname': getattr(user, 'nickname', 'unknown'),
                'image_link': getattr(user, 'image_link', ''),
                'score': getattr(user, 'score', '0'),
                'email': getattr(user, 'email', 'unknown'),
                'userLogin': getattr(user, 'username', 'unknown'),
                'csrfToken': csrf_token,
                'games_played': user.games_played,
                'games_won': user.games_won,
                'games_lost': user.games_lost,
                'winning_rate': round((user.games_won / user.games_played) * 100, 2) if user.games_played > 0 else 0,
            }
            return JsonResponse({'user_info': user_info})
        
        elif request.method == 'POST' and 'image_file' in request.POST:
            try:
              
                image_file = request.FILES.get('image')
                if image_file:
                    pass

                
                user.save()
                return JsonResponse({'message': 'Profile information updated successfully'})
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
        
        
        elif request.method == 'POST' and 'nickname' in request.POST:
            try:
                new_nickname = request.POST.get('nickname')
                if new_nickname is None:
                    return JsonResponse({'error': 'Nickname parameter is missing'}, status=400)
                if not re.match(r'^[a-zA-Z0-9_-]+$', new_nickname):
                    return JsonResponse({'error': 'Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.'}, status=400)

                user2 = MyAppUser.objects.filter(nickname=new_nickname).first()
                if user2 is not None:
                    return JsonResponse({'error': 'Nickname already exists'}, status=400)

                user.nickname = new_nickname
                user.save()
                return JsonResponse({'message': 'Profile information updated successfully'})

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)

        elif request.method == 'POST':
            try:
                if 'image_link' in request.POST:
                    new_imagelink = request.POST.get('image_link')
                    user.image_link = new_imagelink

                    user.save()
                    return JsonResponse({'message': 'Profile information updated successfully'})                
               
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
        elif request.method == 'DELETE':
            Achievement.objects.filter(user=user).delete()
            MyAppUserGroups.objects.filter(user=user).delete()
            MyAppUserPermissions.objects.filter(user=user).delete()
            UserProfile.objects.filter(user=user).delete()
            WaitingPlayer.objects.filter(user=user).delete()
            GameStats.objects.filter(user=user).delete()

            user.delete()
            return JsonResponse({'message': 'Profile deleted successfully'})
        
        elif request.method == 'POST' and '2fa_enabled' in request.POST:
            two_fa_enabled = request.POST.get('2fa_enabled') == 'true'
            user.two_fa_enabled = two_fa_enabled
            user.save()
            return JsonResponse({'message': f'2FA {"enabled" if two_fa_enabled else "disabled"} successfully'})
        
        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def check_2fa_code(request):
    username = request.GET.get('username', None)
    code = request.GET.get('code', None)

    if not username or not code:
        return JsonResponse({'error': 'Username or code parameter is missing'}, status=400)
    if len(code) != 6 or not re.match(r'^\d+$', code):
        return JsonResponse({'error': 'Invalid code format'}, status=400)
    if len(username) > 50 or not is_valid_username(username):
        return JsonResponse({'error': 'Invalid username format'}, status=400)
    try:
        user = MyAppUser.objects.get(username=username)
        saved_activation_code = user.activation_code

        if not saved_activation_code:
            return JsonResponse({'error': '2FA is not enabled for the user'}, status=400)

        
        totp = pyotp.TOTP(saved_activation_code)
        if not totp.verify(code):
            return JsonResponse({'error': 'Invalid 2FA code'}, status=400)

        return JsonResponse({'valid': True})
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
def get_2fa_status(request):
    username = request.POST.get('username', None)
    user = None
    if not username:
        username = request.GET.get('username', None)
    if not username or username == 'null':
        try:
            token = request.headers.get('Authorization', '').split('Bearer ')[-1]
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user = MyAppUser.objects.get(pk=user_id)
            username = user.username
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except MyAppUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    elif len(username) > 50 or not is_valid_username(username):
        return JsonResponse({'error': 'Invalid username format'}, status=400)
    
    try:
        if not user:
            user = MyAppUser.objects.get(username=username)
        is_2fa_enabled = user.two_factor_enabled
        return JsonResponse({'enabled': is_2fa_enabled})
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def generate_qr_code(request):
    
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = MyAppUser.objects.get(pk=user_id)
        if user_id and 'user_id' not in request.session:
            request.session['user_id'] = user_id
        if user.two_factor_enabled:
            return JsonResponse({'error': '2FA is already enabled'}, status=400)
        
        secret_key = pyotp.random_base32()
        user.activation_code = secret_key
        user.save()
        totp = pyotp.TOTP(secret_key)
        
        qr_url = totp.provisioning_uri(user.email, issuer_name='Pong42')
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_bytes = img_io.getvalue()
        
        response = HttpResponse(img_bytes, content_type='image/png')
        response['Content-Disposition'] = 'inline; filename="qr_code.png"'
        return response
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except MyAppUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
   

def activate_2fa(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            activation_code = body.get('activationCode', None)
            if not activation_code:
                return JsonResponse({'error': 'Activation code is missing'}, status=400)
            
            token = request.headers.get('Authorization', '').split('Bearer ')[-1]
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = MyAppUser.objects.get(pk=user_id)
            if user_id and 'user_id' not in request.session:
                request.session['user_id'] = user_id
            
            saved_activation_code = user.activation_code
            
            
            totp = pyotp.TOTP(saved_activation_code)
            if not totp.verify(activation_code):
                return JsonResponse({'error': 'Invalid activation code'}, status=400)
                
            if user.two_factor_enabled:
                return JsonResponse({'error': '2FA is already enabled'}, status=400)
                
            user.two_factor_enabled = True
            user.save()
            return JsonResponse({'success': True})
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except MyAppUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    
def deactivate_2fa(request):
    if request.method == 'POST':
        try:
            token = request.headers.get('Authorization', '').split('Bearer ')[-1]
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = MyAppUser.objects.get(pk=user_id)
            if user_id and 'user_id' not in request.session:
                request.session['user_id'] = user_id
            if not user.two_factor_enabled:
                return JsonResponse({'error': '2FA is not enabled for this user'}, status=400)
            user.two_factor_enabled = False  
            user.save()
            return JsonResponse({'success': True})
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except MyAppUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

def save_tournament_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tournament_data = data.get('tournamentData', [])
            tournament_name = data.get('name')
            if 'undefined' in tournament_name:
                current_datetime = timezone.now().strftime('%m/%d %H:%M')
                tournament_name = re.sub(r'undefined', current_datetime, tournament_name)
            if not tournament_name:
                tournament_name = 'Tournament ' + timezone.now().strftime('%m%d%H%M')

            winner = data.get('winner')
            if not winner:
                winner = ""
            
            tournament, created = Tournament.objects.get_or_create(name=tournament_name)

            # Clear the matches field before appending match information
            tournament.matches = ''

            for game in tournament_data:
                match_number = game.get('matchNumber')
                players = game.get('players')
                result = game.get('result')

                match_info = f"{players[0]} - {players[1]}, 🏆 {result}\n"  # Use cup emoji for winner
                tournament.matches += match_info
                
                # if match_number == len(tournament_data):
                #     tournament.winner = result
            tournament.winner = winner
            tournament.save()
            return JsonResponse({'message': 'Tournament data saved successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

def get_tournament_data(request):
    try:
        # Get page number and items per page from the request
        page_number = request.GET.get('page', 1)
        items_per_page = request.GET.get('items', 10)

        # Query all tournaments ordered by saved_date
        tournaments = Tournament.objects.order_by('-id')


        # Paginate the tournaments
        paginator = Paginator(tournaments, items_per_page)
        page = paginator.get_page(page_number)

        tournament_data_list = []

        # Iterate through the tournaments on the current page
        for tournament in page:
            tournament_data = {
                'name': tournament.name,
                'saved_date': tournament.saved_date.strftime('%Y-%m-%d'),
                'winner': tournament.winner,
                'matches': tournament.matches.splitlines()
            }
            tournament_data_list.append(tournament_data)

        # Return the tournament data for the current page
        return JsonResponse({
            'tournamentData': tournament_data_list,
            'total': paginator.count,
            'per_page': paginator.per_page,
            'page': page.number,
            'has_next': page.has_next(),
            'has_prev': page.has_previous(),
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)