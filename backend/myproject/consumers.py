# your_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Process the message if needed
        # For example, you might save it to the database or broadcast to other clients

        # Send message back to client
        await self.send(text_data=json.dumps({
            'message': message
        }))
