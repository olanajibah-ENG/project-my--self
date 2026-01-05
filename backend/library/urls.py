# =============================================================================
# 📚 LIBRARY API URLS
# =============================================================================
# 
# All these URLs are prefixed with /api/ from the main urls.py
# So path('books/', ...) becomes /api/books/
# =============================================================================

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from library.view.views import (
    RegisterView, 
    BorrowBookView, 
    BookListView, 
    BookDetailView, 
    ReturnBookView,
    UserBorrowsView,
    # ⚠️ NEW: Admin transaction endpoints
    AllTransactionsView,
    TransactionDetailView,
    ExtendBorrowView
)


# =============================================================================
# ⚠️ CUSTOM JWT SERIALIZER
# =============================================================================
# The default SimpleJWT token only includes user_id.
# We add is_staff and username so the frontend knows if user is admin.
# =============================================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT that includes is_staff in token claims."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        token['username'] = user.username
        return token


class PublicTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class PublicTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


# =============================================================================
# URL PATTERNS
# =============================================================================

urlpatterns = [
    # -------------------------------------------------------------------------
    # 🔐 AUTHENTICATION
    # -------------------------------------------------------------------------
    path('auth/signup/', RegisterView.as_view(), name='register'),
    path('auth/login/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'),

    # -------------------------------------------------------------------------
    # 📚 BOOKS (CRUD)
    # -------------------------------------------------------------------------
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/<int:book_id>/', BookDetailView.as_view(), name='book_detail'),

    # -------------------------------------------------------------------------
    # 💳 USER TRANSACTIONS
    # -------------------------------------------------------------------------
    path('borrow/<int:book_id>/', BorrowBookView.as_view(), name='borrow_book'),
    path('return/<int:book_id>/', ReturnBookView.as_view(), name='return_book'),
    path('my-borrows/', UserBorrowsView.as_view(), name='my_borrows'),

    # -------------------------------------------------------------------------
    # ⚠️ NEW: ADMIN TRANSACTION MANAGEMENT
    # -------------------------------------------------------------------------
    # 
    # These endpoints are for administrators to manage all transactions.
    # 
    # 💡 URL DESIGN PATTERNS:
    #    - /transactions/         → Collection (list all)
    #    - /transactions/<id>/    → Single resource (get, update, delete)
    #    - /transactions/<id>/extend/  → Action on a resource
    # -------------------------------------------------------------------------
    path('transactions/', AllTransactionsView.as_view(), name='all_transactions'),
    path('transactions/<int:transaction_id>/', TransactionDetailView.as_view(), name='transaction_detail'),
    path('transactions/<int:transaction_id>/extend/', ExtendBorrowView.as_view(), name='extend_borrow'),
]

# =============================================================================
# 💡 LEARNING POINTS:
# =============================================================================
# 
# 1. URL NAMING:
#    - Use lowercase with hyphens for URLs: /my-borrows/ not /myBorrows/
#    - Use <int:id> for integer path parameters
#    - Use name='...' for reverse URL lookup
#
# 2. REST CONVENTIONS:
#    - Plural nouns for collections: /books/, /transactions/
#    - Actions as sub-paths: /transactions/5/extend/
#
# 3. WHERE MEDIA GOES:
#    - Media files are served from lms/urls.py (main project)
#    - NOT from here! That would put them under /api/media/
# =============================================================================