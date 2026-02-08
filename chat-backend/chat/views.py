from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import LangChainService

ai_service = LangChainService()

@api_view(['POST'])
def chat_api(request):
    """
    API endpoint للاختبار السريع
    POST /api/chat/
    Body: {"message": "سؤالك هنا", "user_id": "test_user"}
    """
    message = request.data.get('message')
    user_id = request.data.get('user_id', 'default_user')
    
    if not message:
        return Response({'error': 'Message is required'}, status=400)
    
    result = ai_service.get_ai_response(user_id, message)
    return Response(result)
