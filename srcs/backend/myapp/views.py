from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core.files.images import ImageFile
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import uuid
import os
from django.conf import settings
import requests
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import json
from .forms import UserRegistrationForm
from .models import Tournament, User
from .serializers import TournamentSerializer
from .models import Player, WaitingPlayer
from .models import Message
from .models import UserProfile
from .models import Feedback
from django.utils import timezone
from django.db import IntegrityError
from django.utils.html import escape
import re
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
import jwt
from jwt.exceptions import InvalidTokenError
from rest_framework import status
from rest_framework.response import Response
import qrcode
import pyotp
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from io import BytesIO
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie


token_obtain_pair_view = TokenObtainPairView.as_view()
token_refresh_view = TokenRefreshView.as_view()


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
            return JsonResponse({'error': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'error': 'An unexpected error occurred', 'details': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)



def show_feedbacks(request):
    if request.method == 'GET':
        try:
            feedbacks = Feedback.objects.all()

            feedback_list = [{'id': feedback.id, 'text': feedback.feedback_text, 'created_at': feedback.created_at} for feedback in feedbacks]

            return JsonResponse({'feedbacks': feedback_list}, status=200)
        except Exception as e:
            return JsonResponse({'error': 'An unexpected error occurred', 'details': str(e)}, status=500)
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
        user_info = {
            'nickname': user.nickname,
            'login': user.username,
            'score': user.score,
            'image_link': user.image_link,
            'csrfToken': csrf_token,

        }
        return JsonResponse({'user': user_info})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def signin42b(request):
    redirect_uri = os.getenv('REDIRECT_URI')
    client_id = os.getenv('CLIENT_ID')
    authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
    return HttpResponseRedirect(authorization_url)

def signin42c(request):    
    redirect_uri = os.getenv('REDIRECT_URI')
    client_id = os.getenv('CLIENT_ID')
    authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
    return HttpResponseRedirect(authorization_url)



def signin42(request):
    
    redirect_uri = os.getenv('REACT_APP_REDIRECT_URI')
    client_id = os.getenv('REACT_APP_CLIENT_ID')
    
    
    authorization_url = f'https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code'
    
    
    return HttpResponseRedirect(authorization_url)

def proxy_userinfo(request):
    
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Code parameter is missing'}, status=400)
    
    
    try:
        jwt_token = request.headers.get('Authorization')
        if not jwt_token:
            return JsonResponse({'error': 'JWT token is missing'}, status=401)

        jwt_authentication = JWTAuthentication()
        authentication_result = jwt_authentication.authenticate(request)
        #print(authentication_result)  # Add this line to see what authenticate() returns

        authenticated_user, _ = authentication_result
        csrf_token = get_token(request)
        
        if authenticated_user is None:
           return JsonResponse({'error': 'Invalid or expired JWT token'}, status=401)
        authenticated_user2 = User.objects.get(id=authentication_result[1]['user_id'])
        
        #print(authentication_result[1]['user_id'])
        
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
        return JsonResponse({'error': str(e)}, status=500)


def proxy_viewb(request):
    
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Code parameter is missing'}, status=400)

    
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')
    csrf_token = get_token(request)

    
    if not client_id or not client_secret or not redirect_uri:
        return JsonResponse({'error': 'Environment variables are not set correctly'}, status=500)

    
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


        
        user, created = User.objects.get_or_create(username=login, email=email)

        
        user.nickname = user_data.get('nickname', user.username)  
        user.score += 0 
        user.image_link = image_link
        user.access_token = access_token
        user.authorization_code = code
        user.save()

        token = AccessToken.for_user(user)
        encoded_token = str(token) 
        redirect_url = f'https://pong42.vercel.app/return.html?code={code}&jwtToken={encoded_token}'
        
        return redirect(redirect_url)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)


def proxy_viewc(request):
    
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Code parameter is missing'}, status=400)

    
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    redirect_uri = os.getenv('REDIRECT_URI')
    csrf_token = get_token(request)

    
    if not client_id or not client_secret or not redirect_uri:
        return JsonResponse({'error': 'Environment variables are not set correctly'}, status=500)

    
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


        
        user, created = User.objects.get_or_create(username=login, email=email)

        
        user.nickname = user_data.get('nickname', user.username)  
        user.score += 0 
        user.image_link = image_link
        user.access_token = access_token
        user.authorization_code = code
        user.save()
        
        token = AccessToken.for_user(user)
        encoded_token = str(token) 
        redirect_url = f'https://localhost:8443/return.html?code={code}&jwtToken={encoded_token}'
        return redirect(redirect_url)
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)


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
    if request.method == 'POST' and request.FILES.get('avatar'):
        avatar_file = request.FILES['avatar']
        
        
        if not avatar_file.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            return Response({"message": "Only image files (PNG, JPG, JPEG, GIF) are allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        
        unique_filename = str(uuid.uuid4()) + avatar_file.name[avatar_file.name.rfind('.'):]
        
        file_path = os.path.join(settings.MEDIA_ROOT, unique_filename)
        with open(file_path, 'wb') as f:
            for chunk in avatar_file.chunks():
                f.write(chunk)
        
        user_profile.avatar = unique_filename
        user_profile.save()

        return Response({"message": "Avatar uploaded successfully."})
    else:
        return Response({"message": "No avatar file provided."}, status=status.HTTP_400_BAD_REQUEST)



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
    tournaments = Tournament.objects.all()
    serializer = TournamentSerializer(tournaments, many=True)
    return JsonResponse(serializer.data, safe=False)


def leaderboard(request):
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    
    try:
        payload = jwt.decode(token, settings.SIGNING_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(pk=user_id)
        
        leaderboard_users = User.objects.order_by('-score')[:100]  
        leaderboard_data = [{'username': user.username, 'date_joined': user.date_joined, 'image_link': user.image_link, 'score': user.score} for user in leaderboard_users]
        
        return JsonResponse(leaderboard_data, safe=False, status=200)
    
    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    

def fetch_messages(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)  # Return error for non-GET requests

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)("chat_group", {"type": "fetch_messages"})
    return JsonResponse({'status': 'success'})


def send_message(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)  # Return error for non-POST requests

    try:
        message_data = json.loads(request.body)
        message = message_data['message']
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)  # Return error for invalid JSON data
    except KeyError:
        return JsonResponse({'error': 'Missing required field "message"'}, status=400)  # Return error for missing "message" field

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
            return JsonResponse({"error": "An error occurred while registering. Please try again later."}, status=500)

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
        return JsonResponse({'error': str(e)}, status=500)



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
            return JsonResponse({'user': user_info})
        
        elif request.method == 'PUT':
            new_nickname = request.POST.get('nickname')
            new_username = request.POST.get('username')
            
            if new_nickname:
                # Check if the new nickname is valid
                if not re.match(r'^[a-zA-Z0-9_-]+$', new_nickname):
                    return JsonResponse({'error': 'Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.'}, status=400)
                user.nickname = new_nickname
            
            if new_username:
                # Check if the new username already exists
                if User.objects.filter(username=new_username).exclude(pk=user_id).exists():
                    return JsonResponse({'error': 'Username already exists'}, status=400)
                user.username = new_username
            
            user.save()
            return JsonResponse({'message': 'Profile information updated successfully'})
        
        elif request.method == 'DELETE':
            # Delete user profile
            user.delete()
            return JsonResponse({'message': 'Profile deleted successfully'})
        
        elif request.method == 'POST' and '2fa_enabled' in request.POST:
            # Toggle 2FA status
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
        return JsonResponse({'error': str(e)}, status=500)

def get_2fa_status(request):
    # Logic to check 2FA status
    # Return JSON response indicating whether 2FA is enabled or not
    return JsonResponse({'enabled': False})

def generate_qr_code(request):
    # Generate a random secret key
    secret_key = pyotp.random_base32()

    # Generate the QR code URL for the secret key
    qr_url = pyotp.totp.TOTP(secret_key).provisioning_uri('user@example.com', issuer_name='YourApp')

    # Generate the QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    # Save the QR code image to a file
    filename = 'qr_code.png'
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_file = ContentFile(img_io.getvalue())
    path = default_storage.save(filename, img_file)

    # Return the QR code image as a response
    with default_storage.open(path) as f:
        response = HttpResponse(f.read(), content_type='image/png')
        response['Content-Disposition'] = 'inline; filename="qr_code.png"'
        return response

def activate_2fa(request):
    if request.method == 'POST':
        # Logic to activate 2FA with the provided activation code
        # Return JSON response indicating success or failure
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    