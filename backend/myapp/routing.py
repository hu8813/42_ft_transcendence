from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from . import consumers
from django.core.asgi import get_asgi_application

websocket_urlpatterns = [
    re_path(r'ws/chatpage/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'chatpage/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/pingpong/$', consumers.PingPongConsumer.as_asgi()),
    re_path(r'pingpong/$', consumers.PingPongConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": get_asgi_application(),
    # WebSocket chat handler
    "websocket": URLRouter(
        websocket_urlpatterns
    ),
})
