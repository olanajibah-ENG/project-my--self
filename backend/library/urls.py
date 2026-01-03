from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from library.view.views import RegisterView, BorrowBookView, BookListView, BookDetailView, ReturnBookView

# Custom views with permissions
class PublicTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

class PublicTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

urlpatterns = [
    # المصادقة
    path('auth/signup/', RegisterView.as_view(), name='register'), # للتسجيل
    path('auth/login/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'), # للدخول والحصول على Token
    path('auth/token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'), # لتجديد التوكن

    # إدارة الكتب (CRUD)
    path('books/', BookListView.as_view(), name='book_list'), # GET: عرض الكتب, POST: إضافة كتاب جديد (Admin)
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book_detail'), # GET/PUT/DELETE: تفاصيل كتاب واحد

    # المعاملات
    path('borrow/<int:book_id>/', BorrowBookView.as_view(), name='borrow_book'), # للاستعارة
    path('return/<int:book_id>/', ReturnBookView.as_view(), name='return_book'), # للإرجاع
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)