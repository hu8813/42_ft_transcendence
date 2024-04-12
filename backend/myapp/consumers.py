import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()  # Accept the WebSocket connection
        self.chat_group_name = 'chat'  # Define a chat group name
        async_to_sync(self.channel_layer.group_add)(
            self.chat_group_name,
            self.channel_name
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.chat_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)  # Parse incoming JSON data
            name = text_data_json.get('name', '')  # Get the 'name' key or default to an empty string
            text = text_data_json.get('text', '')  # Get the 'text' key or default to an empty string
            recipient = text_data_json.get('recipient', '')  # Get the 'recipient' key or default to an empty string

            # Broadcast the received message to all connected clients
            async_to_sync(self.channel_layer.group_send)(
                self.chat_group_name,
                {
                    'type': 'chat_message',
                    'name': name,
                    'text': text,
                    'recipient': recipient
                }
            )
        except json.JSONDecodeError:
            # Handle cases where the received data is not valid JSON
            pass

    def chat_message(self, event):
        name = event['name']
        text = event['text']
        recipient = event['recipient']

        # Send message to the client
        self.send(text_data=json.dumps({
            'name': name,
            'text': text,
            'recipient': recipient
        }))
