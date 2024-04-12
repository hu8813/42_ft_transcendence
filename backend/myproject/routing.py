from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path, re_path
from . import consumers
from django.core.asgi import get_asgi_application

websocket_urlpatterns = [
    re_path(r'ws/chatpage/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'chatpage/$', consumers.ChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    
    "http": get_asgi_application(),
    
    "websocket": URLRouter(
        websocket_urlpatterns
    ),
})