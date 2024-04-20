import json
import html  
from channels.generic.websocket import WebsocketConsumer, AsyncWebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(AsyncWebsocketConsumer):
    def connect(self):
        self.accept()  
        self.chat_group_name = 'chat'  
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
            text_data_json = json.loads(text_data)  
            name = text_data_json.get('name', '')  
            text = text_data_json.get('text', '')  
            recipient = text_data_json.get('recipient', '')  

            
            name = html.escape(name)
            text = html.escape(text)
            recipient = html.escape(recipient)

            
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
            
            pass

    def chat_message(self, event):
        name = event['name']
        text = event['text']
        recipient = event['recipient']

        
        self.send(text_data=json.dumps({
            'name': name,
            'text': text,
            'recipient': recipient
        }))


class PingPongConsumer(AsyncWebsocketConsumer):
    def connect(self):
        self.accept()  
        self.pingpong_group_name = 'pingpong'  
        async_to_sync(self.channel_layer.group_add)(
            self.pingpong_group_name,
            self.channel_name
        )

        
        number_of_players = len(async_to_sync(self.channel_layer.group_channel_names)(self.pingpong_group_name))
        if number_of_players < 2:
            
            self.send(text_data=json.dumps({
                'message': 'Waiting for another player to join...'
            }))
        else:
            
            self.send(text_data=json.dumps({
                'message': 'Starting the game...'
            }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.pingpong_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)  
            nickname = text_data_json.get('nickname')  
            keycode = text_data_json.get('keycode')  

            
            self.scope['nickname'] = nickname

            
            async_to_sync(self.channel_layer.group_send)(
                self.pingpong_group_name,
                {
                    'type': 'move_paddle',
                    'keycode': keycode
                }
            )
        except json.JSONDecodeError:
            
            pass

    def move_paddle(self, event):
        keycode = event['keycode']

        
        self.send(text_data=json.dumps({
            'keycode': keycode
        }))
