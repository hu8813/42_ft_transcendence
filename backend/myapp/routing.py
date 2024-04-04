from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path, re_path
from . import consumers
from django.core.asgi import get_asgi_application


websocket_urlpatterns = [
    path('ws/chat/', consumers.ChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": get_asgi_application(),
    # WebSocket chat handler
    "websocket": URLRouter(
        websocket_urlpatterns
    ),
})