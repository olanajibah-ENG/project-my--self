from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView
from library.view.views import RegisterView, BorrowBookView, BookListView, BookDetailView, ReturnBookView

urlpatterns = [
    # المصادقة
    path('signup/', RegisterView.as_view()), # للتسجيل
    path('login/', TokenObtainPairView.as_view()), # للدخول والحصول على Token

    # إدارة الكتب (CRUD)
    path('books/', BookListView.as_view()), # GET: عرض الكتب, POST: إضافة كتاب جديد (Admin)
    path('books/<int:book_id>/', BookDetailView.as_view()), # GET/PUT/DELETE: تفاصيل كتاب واحد

    # المعاملات
    path('borrow/<int:book_id>/', BorrowBookView.as_view()), # للاستعارة
    path('return/<int:book_id>/', ReturnBookView.as_view()), # للإرجاع
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)