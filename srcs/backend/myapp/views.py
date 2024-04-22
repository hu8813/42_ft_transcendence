from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.core.serializers import serialize
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.authtoken.models import Token
from django.conf import settings
import requests
import uuid
import os
import json
from .forms import UserRegistrationForm
from .models import Tournament, User, Player, WaitingPlayer, Message, UserProfile, Feedback, Achievement, MyAppUserGroups, MyAppUserPermissions, Channel
from django.utils import timezone
from django.db import IntegrityError
from django.utils.html import escape
import re
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework_simplejwt.tokens import AccessToken
import jwt
from jwt.exceptions import InvalidTokenError
from rest_framework import status
import qrcode
import pyotp
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from io import BytesIO
from django.middleware.csrf import get_token
from django.contrib.sessions.models import Session
from datetime import timedelta
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.sessions.backends.db import SessionStore
from urllib.parse import quote
from django.db.models import Case, When
from pyotp import TOTP
from django.db.models import F, ExpressionWrapper, FloatField

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
        user_requester = User.objects.get(pk=user_id)
        
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        friend = User.objects.get(username=username)
        
        if friend == user_requester:
            return JsonResponse({'message': "You cannot remove yourself as a friend."}, status=400)
        
        if friend not in user_requester.friends.all():
            return JsonResponse({'message': f"{friend.username} is not your friend."}, status=400)
        
        user_requester.friends.remove(friend)
        user_requester.save()
        
        return JsonResponse({'message': f"{friend.username} removed from friends successfully."})
    
    except User.DoesNotExist:
        return JsonResponse({'message': "Friend not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)


def add_friend(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = User.objects.get(pk=user_id)
        
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        friend = User.objects.get(username=username)
        
        if friend == user_requester:
            return JsonResponse({'message': "You cannot add yourself as a friend."}, status=400)
        
        if friend in user_requester.friends.all():
            return JsonResponse({'message': f"{friend.username} is already your friend."}, status=400)
        
        user_requester.friends.add(friend)
        user_requester.save()
        
        return JsonResponse({'message': f"{friend.username} added as a friend successfully."})
    
    except User.DoesNotExist:
        return JsonResponse({'message': "Friend not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=401)
    
def get_friends(request):
    try:
        
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        
        user = User.objects.get(pk=user_id)
        
        
        requested_username = request.GET.get('username')
        
        
        if requested_username:
            requested_user = User.objects.get(username=requested_username)
            friends = requested_user.friends.all()
        else:
            
            friends = user.friends.all()
        
        
        friend_list = [{'username': friend.username, 'nickname': friend.nickname, 'image_link': friend.image_link} for friend in friends]
        
        return JsonResponse({'friends': friend_list})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT token expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def unblock_user(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = User.objects.get(pk=user_id)
        
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        user_to_unblock = User.objects.get(username=username)
        
        if user_to_unblock == user_requester:
            return JsonResponse({'message': "You cannot unblock yourself."}, status=400)
        
        if user_to_unblock not in user_requester.blocked_users.all():
            return JsonResponse({'message': f"{user_to_unblock.username} is not blocked."}, status=400)
        
        user_requester.blocked_users.remove(user_to_unblock)
        user_requester.save()
        
        return JsonResponse({'message': f"{user_to_unblock.username} unblocked successfully."})
    
    except User.DoesNotExist:
        return JsonResponse({'message': "User to unblock not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)

def block_user(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = User.objects.get(pk=user_id)
        
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({'message': "Username parameter is missing."}, status=400)
        
        if not is_valid_username(username):
            return JsonResponse({'message': "Invalid username format. Only alphanumeric characters, underscore, and hyphen are allowed, and the length should not exceed 50 characters."}, status=400)
        
        user_to_block = User.objects.get(username=username)
        
        if user_to_block == user_requester:
            return JsonResponse({'message': "You cannot block yourself."}, status=400)
        
        if user_to_block in user_requester.blocked_users.all():
            return JsonResponse({'message': f"{user_to_block.username} is already blocked."}, status=400)
        
        user_requester.blocked_users.add(user_to_block)
        user_requester.save()
        
        return JsonResponse({'message': f"{user_to_block.username} blocked successfully."})
    
    except User.DoesNotExist:
        return JsonResponse({'message': "User to block not found."}, status=404)
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': "JWT token has expired."}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': "Invalid JWT token."}, status=401)
    except KeyError:
        return JsonResponse({'message': "Invalid or missing user_id in JWT token."}, status=401)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=401)


def fetch_achievements(request):
    try:
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        achievements = Achievement.objects.filter(user_id=user_id).first()

        if not achievements:
            return JsonResponse({'error': 'Achievements not found'}, status=200)

        data = {
            'games_played': achievements.games_played,
            'games_won': achievements.games_won,
            'games_lost': achievements.games_lost,
            'tournaments_won': achievements.tournaments_won,
            'favorite_game': achievements.favorite_game,
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
    
def logout_view(request):
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]

    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        session_key = f"_auth_user_id:{user_id}"
        
        if session_key:
            try:
                session = Session.objects.get(session_key=session_key)
                session.delete()
            except Session.DoesNotExist:
                pass

        request.session.flush()

        return JsonResponse({'success': 'Logged out successfully'})
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)


def get_all_users(request):
    all_users = User.objects.values_list('username', flat=True)
    return JsonResponse(list(all_users), safe=False)



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


@csrf_exempt
def get_online_users(request):
    try:
        time_threshold = timezone.now() - timedelta(minutes=42)
        
        active_sessions = Session.objects.filter(expire_date__gte=time_threshold)
        
        online_user_ids = set()  
        for session in active_sessions:
            decoded_data = session.get_decoded()
            user_id = decoded_data.get('_auth_user_id')
            online_user_ids.add(user_id)  
        
        online_users = []
        for user_id in online_user_ids:
            try:
                user = User.objects.get(id=user_id)
                online_users.append({
                    'username': user.username,
                    'nickname': user.nickname,
                    'image_link': user.image_link if hasattr(user, 'image_link') else None
                })
            except ObjectDoesNotExist:
                pass
        
        if not online_users:
            return JsonResponse({'online_users': []})  
        
        return JsonResponse({'online_users': online_users})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

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
        messages = list(Message.objects.order_by('created_at')[:50].values())
        return JsonResponse(messages, safe=False)
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        
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
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


def chat(request):
    return render(request, 'chatpage.html')

from django.contrib.sessions.models import Session

def get_profile_info(request):
    username = request.GET.get('username')
    
    if not username:
        return JsonResponse({'error': 'Username parameter is missing'}, status=400)
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    
    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user_requester = User.objects.get(pk=user_id)
        user = User.objects.get(username=username)
        csrf_token = get_token(request)
        
        is_online = False
        active_sessions = Session.objects.filter(expire_date__gte=timezone.now())
        for session in active_sessions:
            session_data = session.get_decoded()
            if '_auth_user_id' in session_data and str(user.id) == session_data['_auth_user_id']:
                is_online = True
                break
        
        # Query achievements for the user
        achievements = Achievement.objects.filter(user_id=user.id).first()

        # Calculate winning rate
        games_played = achievements.games_played if achievements else 0
        games_won = achievements.games_won if achievements else 0
        games_lost = achievements.games_lost if achievements else 0
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
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def signin42b(request):
    redirect_uri = os.getenv('REDIRECT_URI')
    client_id = os.getenv('CLIENT_ID')
    authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
    return HttpResponseRedirect(authorization_url)

def signin42c(request):
    client_id = os.getenv('CLIENT_ID')

    referral_url = request.GET.get('referral_url')
    
    if referral_url:
        referral_url = quote(referral_url)  
    
    authorization_url = f'https://pong42.vercel.app/callback.html?client_id={client_id}&referral_url={referral_url}'
    return HttpResponseRedirect(authorization_url)

def signin42(request):
    
    redirect_uri = os.getenv('REACT_APP_REDIRECT_URI')
    client_id = os.getenv('REACT_APP_CLIENT_ID')
    
    
    authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
    
    
    return HttpResponseRedirect(authorization_url)

def proxy_userinfo(request):
    
    #code = request.GET.get('code')
    #if not code:
    
   
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
        authenticated_user2 = User.objects.get(id=authentication_result[1]['user_id'])
        
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
        }
        return JsonResponse({'user': user_info})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def proxy_viewb(request):
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Code parameter is missing'}, status=400)

    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')
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
            user = User.objects.get(username=login)
        except User.DoesNotExist:
            
            user = User.objects.create_user(username=login, email=email)

            user.nickname = user_data.get('nickname', user.username)
            user.image_link = image_link
            user.save()

        token = AccessToken.for_user(user)
        encoded_token = str(token)
        redirect_url = f'https://pong42.vercel.app/return.html?jwtToken={encoded_token}'

        return redirect(redirect_url)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=400)
    
def proxy_viewc(request):
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Code parameter is missing'}, status=400)

    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')
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
            user = User.objects.get(username=login)
        except User.DoesNotExist:
            
            user = User.objects.create_user(username=login, email=email)

            user.nickname = user_data.get('nickname', user.username)
            user.image_link = image_link
            user.save()

        token = AccessToken.for_user(user)
        encoded_token = str(token)
        redirect_url = f'/return.html?jwtToken={encoded_token}'

        return redirect(redirect_url)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
def obtain_token(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        user = User.objects.filter(username=username).first()
        if user is not None and user.check_password(password):
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        else:
            return Response({'error': 'Invalid credentials'}, status=400)


def get_email(request):
    
    
    user = request.user  
    if user.is_authenticated:
        email = user.email
        return JsonResponse({'email': email})
    else:
        return JsonResponse({'error': 'User is not authenticated'}, status=401)

def get_nickname(request):
    user = request.user
    if user.is_authenticated:
        nickname = user.nickname  
        return JsonResponse({'nickname': nickname})
    else:
        return JsonResponse({'error': 'User is not authenticated'}, status=401)

@api_view(['POST'])
def update_nickname(request):
    if request.method == 'POST':
        new_nickname = request.data.get('nickname')  
        user = request.user
        if user.is_authenticated:
            user.nickname = new_nickname
            user.save()
            return JsonResponse({"message": "Nickname updated successfully."})
        else:
            return JsonResponse({'error': 'User is not authenticated'}, status=401)
    else:
        return JsonResponse({"message": "Invalid request method."}, status=400)


@api_view(['POST'])
def upload_avatar(request):
    try:
        
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        try:
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = User.objects.get(pk=user_id)
        except jwt.ExpiredSignatureError:
            return Response({"message": "JWT token has expired."}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"message": "Invalid JWT token."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
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
        print(f"An error occurred: {str(e)}")
        return Response({"message": "An error occurred while uploading the avatar."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def update_score(request):
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(pk=user_id)
        
        result = request.GET.get('result') 
        user.score += 1
        user.save()

        # Try to retrieve the Achievement object for the user
        try:
            achievements = Achievement.objects.get(user=user)
        except Achievement.DoesNotExist:
            # If Achievement object does not exist, create a new one
            achievements = Achievement.objects.create(user=user)

        achievements.games_played += 1

        if result == 'win':
            achievements.games_won += 1
        elif result == 'lost':
            achievements.games_lost += 1

        achievements.save()

        return JsonResponse({'message': 'Score and achievements updated successfully'})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'JWT signature has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid JWT token'}, status=401)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

def get_score(request):
    
    users = User.objects.all()
    
    
    user_data = serialize('json', users)
    
    
    score = 100  
    
    
    response_data = {
        'score': score,
        'users': user_data
    }
    
    return JsonResponse(response_data)


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
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    
    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(pk=user_id)
        
        leaderboard_users = User.objects.order_by('-score')[:100]  

        leaderboard_data = []
        for user in leaderboard_users:
            try:
                achievements = Achievement.objects.get(user=user)
                total_games_played = achievements.games_played
                total_games_won = achievements.games_won
            except Achievement.DoesNotExist:
                total_games_played = 0
                total_games_won = 0

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
                'winning_rate': round(winning_rate/100, 2)  # Round to 2 decimal places
            }
            leaderboard_data.append(user_data)
        
        return JsonResponse(leaderboard_data, safe=False, status=200)
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
def fetch_messages(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)  

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)("chat_group", {"type": "fetch_messages"})
    return JsonResponse({'status': 'success'})


def send_message(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)  

    try:
        message_data = json.loads(request.body)
        message = message_data['message']
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)  
    except KeyError:
        return JsonResponse({'error': 'Missing required field "message"'}, status=400)  

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)("chat_group", {"type": "send_message", "message": message})
    return JsonResponse({'status': 'success'})

@ensure_csrf_cookie
def get_csrf_token(request):
    csrf_token = get_token(request)    
    return JsonResponse({'csrfToken': csrf_token})


def register(request):
    if request.method == 'POST':
        try:
            username2 = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            if not username2 or not email or not password or not confirm_password:
                return JsonResponse({"error": "All fields are required."}, status=400)

            if not re.match(r'^[\w-]+$', username2):
                return JsonResponse({"error": "Username can only contain alphanumeric characters, underscores, and hyphens."}, status=400)

            if not re.match(r'^[\w\.-]+@[\w\.-]+$', email):
                return JsonResponse({"error": "Invalid email format. Please enter a valid email address."}, status=400)

            if len(password) < 8:
                return JsonResponse({"error": "Password must be at least 8 characters long."}, status=400)

            if not any(char.isdigit() for char in password):
                return JsonResponse({"error": "Password must contain at least one digit."}, status=400)

            if not any(char.isupper() for char in password):
                return JsonResponse({"error": "Password must contain at least one uppercase letter."}, status=400)

            if not all(char.isalnum() or char in ['_', '-'] for char in username2):
                return JsonResponse({"error": "Username can only contain alphanumeric characters, underscores, and hyphens."}, status=400)

            if User.objects.filter(username=username2).exists():
                return JsonResponse({"error": "Username already exists. Please choose a different username."}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already exists. Please use a different email address."}, status=400)

            if password != confirm_password:
                return JsonResponse({"error": "Passwords do not match. Please make sure your passwords match."}, status=400)

            user = User.objects.create_user(username=username2, nickname=username2, email=email, password=password, score=0)
            user.nickname = username2
            user.save()
            
            return JsonResponse({"message": "Registration successful. You can now log in."}, status=200)

        except Exception as e:
            return JsonResponse({"error": "An error occurred while registering. Please try again later."}, status=400)

    else:
        return render(request, 'registration/register.html')
    

def login_view(request):
    try:
        if request.method == 'POST':
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
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
            return render(request, 'login.html')
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)



def update_player_position(request):
    if request.method == 'POST':
        
        player_id = request.POST.get('player_id')
        position_x = request.POST.get('position_x')
        position_y = request.POST.get('position_y')

        
        try:
            player = Player.objects.get(id=player_id)
            player.position_x = position_x
            player.position_y = position_y
            player.save()
            return JsonResponse({'success': True})
        except Player.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Player not found'})

    
    return JsonResponse({'success': False, 'error': 'Invalid HTTP method'})


def get_game_state(request):
    
    players = Player.objects.all()
    game_state = [{'id': player.id, 'name': player.name, 'position_x': player.position_x, 'position_y': player.position_y} for player in players]
    return JsonResponse({'game_state': game_state})

waiting_queue = []


def home(request):
    return render(request, 'frontend/index.html')

def custom_404(request, exception):
    return render(request, '404.html', status=404)


def check_player_waiting(request, user_login):
    global waiting_queue

    
    if waiting_queue:
        
        matched_user = waiting_queue.pop(0)  
        
        return JsonResponse({'waiting': True, 'matched_user': matched_user, 'current_user': user_login})
    else:
        
        waiting_queue.append(user_login)  
        return JsonResponse({'waiting': False})




def cancel_waiting(request, user_login):
    global waiting_queue

    
    waiting_queue = [player for player in waiting_queue if player != user_login]
    return JsonResponse({'message': f'User {user_login} removed from waiting queue'})

def manage_profile(request):
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    
    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(pk=user_id)
        csrf_token = get_token(request)
        
        if request.method == 'GET':
            user_info = {
                'userNickname': getattr(user, 'nickname', 'unknown'),
                'image_link': getattr(user, 'image_link', ''),
                'score': getattr(user, 'score', '0'),
                'email': getattr(user, 'email', 'unknown'),
                'userLogin': getattr(user, 'username', 'unknown'),
                'csrfToken': csrf_token,
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
                
                if new_nickname:
                    if not re.match(r'^[a-zA-Z0-9_-]+$', new_nickname):
                        return JsonResponse({'error': 'Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.'}, status=400)
                    user.nickname = new_nickname
                
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
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def check_2fa_code(request):
    username = request.GET.get('username', None)
    code = request.GET.get('code', None)

    if not username or not code:
        return JsonResponse({'error': 'Username or code parameter is missing'}, status=400)

    try:
        user = User.objects.get(username=username)
        saved_activation_code = user.activation_code

        if not saved_activation_code:
            return JsonResponse({'error': '2FA is not enabled for the user'}, status=400)

        
        totp = TOTP(saved_activation_code)
        if not totp.verify(code):
            return JsonResponse({'error': 'Invalid 2FA code'}, status=400)

        return JsonResponse({'valid': True})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
def get_2fa_status(request):
    username = request.GET.get('username', None)

    if not username:
        return JsonResponse({'error': 'Username parameter is missing'}, status=400)

    try:
        user = User.objects.get(username=username)
        is_2fa_enabled = user.two_factor_enabled if hasattr(user, 'two_factor_enabled') else False
        return JsonResponse({'enabled': is_2fa_enabled})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
def generate_qr_code(request):
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    
    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(pk=user_id)
        
        if user.two_factor_enabled:
            return JsonResponse({'error': '2FA is already enabled'}, status=400)
        
        secret_key = pyotp.random_base32()
        user.activation_code = secret_key
        user.save()
        totp = TOTP(secret_key)
        
        
        
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
        
        filename = f'{user.username}_qr_code.png'
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_file = ContentFile(img_io.getvalue())
        path = default_storage.save(filename, img_file)
        
        with default_storage.open(path) as f:
            response = HttpResponse(f.read(), content_type='image/png')
            response['Content-Disposition'] = 'inline; filename="qr_code.png"'
            return response
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except User.DoesNotExist:
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
            user = User.objects.get(pk=user_id)
            
            
            saved_activation_code = user.activation_code
            
            
            totp = TOTP(saved_activation_code)
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
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=401)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    
def deactivate_2fa(request):
    if request.method == 'POST':
        token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        try:
            payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            user = User.objects.get(pk=user_id)
            if not user.two_factor_enabled:
                return JsonResponse({'error': '2FA is not enabled for this user'}, status=400)
            user.two_factor_enabled = False  
            user.save()
            return JsonResponse({'success': True})
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)