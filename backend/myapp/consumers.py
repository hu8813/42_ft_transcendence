import json
from channels.generic.websocket import WebsocketConsumer

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()  # Accept the WebSocket connection

    def disconnect(self, close_code):
        pass  # Handle WebSocket disconnection

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)  # Parse incoming JSON data
            message = text_data_json.get('message', '')  # Get the 'message' key or default to an empty string
            self.send(text_data=json.dumps({'message': message}))  # Send the received message back to the client
        except json.JSONDecodeError:
            # Handle cases where the received data is not valid JSON
            pass
