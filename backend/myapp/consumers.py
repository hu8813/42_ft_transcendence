import json
from channels.generic.websocket import WebsocketConsumer

class ChatConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.messages = []

    def connect(self):
        from .models import Message  # Deferred import
        self.accept()  # Accept the WebSocket connection
        # Send existing messages to the client upon connection
        for message in self.messages:
            self.send_message(message)

    def disconnect(self, close_code):
        pass  # Handle WebSocket disconnection

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)  # Parse incoming JSON data
            name = text_data_json.get('name', '')  # Get the 'name' key or default to an empty string
            text = text_data_json.get('text', '')  # Get the 'text' key or default to an empty string
            recipient = text_data_json.get('recipient', '')  # Get the 'recipient' key or default to an empty string
            
            from .models import Message  # Deferred import
            # Save the received message to the database
            message = Message.objects.create(name=name, text=text, recipient=recipient)
            self.messages.append(message)  # Store the received message
            self.send_message(message.text)  # Send the received message back to the client
        except json.JSONDecodeError:
            # Handle cases where the received data is not valid JSON
            pass

    def send_message(self, message):
        # Send message to the client
        self.send(text_data=json.dumps({'message': message}))
