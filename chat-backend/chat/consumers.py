import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .services import OpenRouterService

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "global_chat_room"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_message = data.get('message')
        chat_type = data.get('type')  # 'user_to_user' or 'user_to_ai'
        sender_name = data.get('sender', 'Anonymous')

        # 1. بث رسالة المستخدم فوراً للجميع
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_message',
                'message': user_message,
                'sender': sender_name,
                'msg_type': 'user_msg'
            }
        )

        # 2. إذا كانت موجهة للـ AI
        if chat_type == 'user_to_ai':
            ai_service = OpenRouterService()
            ai_reply = ai_service.get_ai_response(user_message)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_message',
                    'message': ai_reply,
                    'sender': 'Gemini AI',
                    'msg_type': 'ai_msg'
                }
            )

    async def broadcast_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'msg_type': event['msg_type']
        }))