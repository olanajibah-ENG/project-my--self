import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
# استدعاء الخدمة الجديدة
from .services import LangChainService

class ChatConsumer(AsyncWebsocketConsumer):
    # إنشاء نسخة واحدة من الخدمة لمشاركتها
    ai_service = LangChainService()

    async def connect(self):
        self.room_group_name = "global_chat_room"
        # نستخدم channel_name كـ ID فريد لتخزين ذاكرة المحادثة لهذا الاتصال
        self.user_session_id = self.channel_name 
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        user_message = data.get('message')
        chat_type = data.get('type')
        sender_name = data.get('sender', 'Anonymous')

        # بث رسالة المستخدم
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'broadcast_message',
                'message': user_message,
                'sender': sender_name,
                'msg_type': 'user_msg'
            }
        )

        if chat_type == 'user_to_ai':
            await self.send(text_data=json.dumps({'type': 'typing', 'sender': 'Gemini AI', 'active': True}))

            try:
                # طلب الرد من LangChain (نمرر Session ID لإدارة الذاكرة)
                ai_data = await sync_to_async(self.ai_service.get_ai_response)(self.user_session_id, user_message)

                # بث رد الـ AI مع الأسئلة المقترحة
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast_message',
                        'message': ai_data['answer'], # الرد النصي (Markdown)
                        'suggested_questions': ai_data['suggested_questions'], # الأسئلة المقترحة
                        'sender': 'Gemini AI',
                        'msg_type': 'ai_msg'
                    }
                )
            finally:
                await self.send(text_data=json.dumps({'type': 'typing', 'sender': 'Gemini AI', 'active': False}))

    async def broadcast_message(self, event):
        # نرسل الحقول الجديدة للفرونت إند
        payload = {
            'message': event['message'],
            'sender': event['sender'],
            'msg_type': event['msg_type'],
            'suggested_questions': event.get('suggested_questions', []) # إرسالها إن وجدت
        }
        await self.send(text_data=json.dumps(payload))