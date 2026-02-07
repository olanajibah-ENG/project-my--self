import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
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
        # 2. إذا كانت موجهة للـ AI
        if chat_type == 'user_to_ai':
            # إرسال إشعار بأن الـ AI يكتب (مباشرة للمستخدم الحالي لضمان السرعة)
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'sender': 'Gemini AI',
                'active': True
            }))
            
            # (اختياري) بث للآخرين أيضاً
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_typing',
                    'sender': 'Gemini AI',
                    'active': True
                }
            )

            try:
                ai_service = OpenRouterService()
                ai_reply = await sync_to_async(ai_service.get_ai_response)(user_message)

                # إرسال رد الـ AI
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast_message',
                        'message': ai_reply,
                        'sender': 'Gemini AI',
                        'msg_type': 'ai_msg'
                    }
                )
            finally:
                # إخفاء مؤشر الكتابة (مباشرة للمستخدم الحالي)
                await self.send(text_data=json.dumps({
                    'type': 'typing',
                    'sender': 'Gemini AI',
                    'active': False
                }))
                
                # بث إخفاء المؤشر للآخرين
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast_typing',
                        'sender': 'Gemini AI',
                        'active': False
                    }
                )

    async def broadcast_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'msg_type': event['msg_type']
        }))

    async def broadcast_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender': event['sender'],
            'active': event['active']
        }))
