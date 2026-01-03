from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def test_view(request):
    return JsonResponse({"message": "Test successful"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('test/', test_view),  # للتحقق
    path('api/', include('library.urls')),  # يجب أن يكون موجوداً
]