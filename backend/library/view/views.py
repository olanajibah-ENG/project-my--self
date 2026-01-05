# =============================================================================
# 📚 LIBRARY VIEWS - API endpoints for the Library Management System
# =============================================================================
# 
# This file contains all the Django REST Framework views for the library app.
# 
# 💡 ARCHITECTURE: The views use LibraryService for business logic, keeping
#    the views thin and focused only on HTTP request/response handling.
# =============================================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from library.serializer.serializers import UserRegisterSerializer, BookSerializer, TransactionSerializer
from library.service.services import LibraryService
from library.model.models import Book, Transaction
from datetime import datetime, timedelta


# =============================================================================
# 🔐 AUTHENTICATION VIEWS
# =============================================================================

class RegisterView(APIView):
    """
    POST /api/auth/signup/
    Register a new user account.
    
    💡 TIP: This returns a custom response with both user data and tokens.
       Compare this to the login endpoint which uses SimpleJWT's default.
    """
    permission_classes = []  # Allow unauthenticated access
    
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens for immediate login after registration
            refresh = RefreshToken.for_user(user)
            return Response({
                "msg": "تم التسجيل بنجاح",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                },
                "token": str(refresh.access_token),
                "refresh_token": str(refresh)
            }, status=201)
        return Response(serializer.errors, status=400)


# =============================================================================
# 📚 BOOK VIEWS
# =============================================================================

class BookListView(APIView):
    """
    GET /api/books/ - List all books
    POST /api/books/ - Create a new book (Admin only)
    """
    permission_classes = []  # Allow unauthenticated GET
    
    def get(self, request):
        books = Book.objects.all()
        # ✅ Pass request context for absolute URLs in cover_image
        serializer = BookSerializer(books, many=True, context={'request': request})
        return Response(serializer.data, status=200)
    
    def post(self, request):
        # Admin only check
        if not request.user.is_staff:
            return Response({"error": "غير مسموح - مطلوب صلاحيات مدير"}, status=403)
        
        serializer = BookSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class BookDetailView(APIView):
    """
    GET /api/books/<id>/ - Get book details
    PUT /api/books/<id>/ - Update a book (Admin only)
    DELETE /api/books/<id>/ - Delete a book (Admin only)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
            serializer = BookSerializer(book, context={'request': request})
            return Response(serializer.data, status=200)
        except Book.DoesNotExist:
            return Response({"error": "الكتاب غير موجود"}, status=404)
    
    def put(self, request, book_id):
        if not request.user.is_staff:
            return Response({"error": "غير مسموح - مطلوب صلاحيات مدير"}, status=403)
        
        try:
            book = Book.objects.get(id=book_id)
            serializer = BookSerializer(book, data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        except Book.DoesNotExist:
            return Response({"error": "الكتاب غير موجود"}, status=404)
    
    def delete(self, request, book_id):
        if not request.user.is_staff:
            return Response({"error": "غير مسموح - مطلوب صلاحيات مدير"}, status=403)
        
        try:
            book = Book.objects.get(id=book_id)
            book.delete()
            return Response({"message": "تم حذف الكتاب بنجاح"}, status=204)
        except Book.DoesNotExist:
            return Response({"error": "الكتاب غير موجود"}, status=404)


# =============================================================================
# 💳 TRANSACTION VIEWS - Borrow/Return Operations
# =============================================================================

class BorrowBookView(APIView):
    """
    POST /api/borrow/<book_id>/
    Borrow a book. Authenticated users only.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, book_id):
        try:
            transaction = LibraryService.borrow_logic(request.user, book_id)
            return Response({"msg": "تمت الاستعارة"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class ReturnBookView(APIView):
    """
    POST /api/return/<book_id>/
    Return a borrowed book. Authenticated users only.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, book_id):
        try:
            transaction = LibraryService.return_logic(request.user, book_id)
            return Response({"msg": "تم إرجاع الكتاب بنجاح"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class UserBorrowsView(APIView):
    """
    GET /api/my-borrows/
    Get the authenticated user's borrow history.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        borrows = Transaction.objects.filter(
            user=request.user,
            action_type='borrow'
        ).select_related('book').order_by('-date')
        
        serializer = TransactionSerializer(borrows, many=True, context={'request': request})
        return Response(serializer.data, status=200)


# =============================================================================
# ⚠️ NEW: ADMIN TRANSACTION VIEWS
# =============================================================================
# 
# These endpoints are for administrators to manage all transactions:
# - View all transactions in the system
# - Update transaction status (active/returned/overdue)
# - Extend borrow periods
# 
# 💡 SECURITY: All these endpoints check request.user.is_staff
# =============================================================================

class AllTransactionsView(APIView):
    """
    GET /api/transactions/
    List ALL transactions in the system. Admin only.
    
    💡 TIP: This is different from UserBorrowsView which only returns
       the current user's transactions.
    
    ⚠️ SECURITY: Always check is_staff for admin-only endpoints!
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # ✅ Check if user is admin
        if not request.user.is_staff:
            return Response(
                {"error": "غير مسموح - مطلوب صلاحيات مدير"},
                status=403
            )
        
        # Get all transactions, ordered by most recent
        transactions = Transaction.objects.all().select_related(
            'user', 'book'
        ).order_by('-date')
        
        serializer = TransactionSerializer(
            transactions,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=200)


class TransactionDetailView(APIView):
    """
    GET /api/transactions/<id>/ - Get transaction details
    PATCH /api/transactions/<id>/ - Update transaction (Admin only)
    
    💡 LEARNING POINT: PATCH vs PUT
       - PUT: Replace the entire resource
       - PATCH: Update specific fields only
       
       For updating just the status, PATCH is more appropriate.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, transaction_id):
        if not request.user.is_staff:
            return Response({"error": "غير مسموح"}, status=403)
        
        try:
            transaction = Transaction.objects.select_related('user', 'book').get(id=transaction_id)
            serializer = TransactionSerializer(transaction, context={'request': request})
            return Response(serializer.data, status=200)
        except Transaction.DoesNotExist:
            return Response({"error": "المعاملة غير موجودة"}, status=404)
    
    def patch(self, request, transaction_id):
        """
        Update a transaction's status.
        
        Expected body: { "status": "active" | "returned" | "overdue" }
        
        ⚠️ NOTE: The current Transaction model doesn't have a status field!
        We'd need to add it, or derive it from action_type.
        For now, we'll update action_type as a workaround.
        """
        if not request.user.is_staff:
            return Response({"error": "غير مسموح"}, status=403)
        
        try:
            transaction = Transaction.objects.get(id=transaction_id)
            
            # Get the new status from request
            new_status = request.data.get('status')
            
            if new_status == 'returned':
                # Mark as returned by changing action_type
                transaction.action_type = 'return'
                transaction.save()
                
                # Also increment book quantity
                transaction.book.quantity += 1
                transaction.book.save()
                
            return Response({
                "msg": "تم تحديث المعاملة",
                "status": new_status
            }, status=200)
            
        except Transaction.DoesNotExist:
            return Response({"error": "المعاملة غير موجودة"}, status=404)


class ExtendBorrowView(APIView):
    """
    POST /api/transactions/<id>/extend/
    Extend a borrow's return date. Admin only.
    
    Expected body: { "new_return_date": "2024-02-15" }
    
    ✅ UPDATED: Now actually saves the new return date using LibraryService!
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, transaction_id):
        if not request.user.is_staff:
            return Response({"error": "غير مسموح"}, status=403)
        
        try:
            new_date = request.data.get('new_return_date')
            
            if not new_date:
                return Response({"error": "يجب تحديد تاريخ الإرجاع الجديد"}, status=400)
            
            # ✅ Use the service method to extend the borrow
            transaction = LibraryService.extend_borrow(transaction_id, new_date)
            
            return Response({
                "msg": "تم تمديد فترة الاستعارة",
                "new_return_date": str(transaction.expected_return_date)
            }, status=200)
            
        except Transaction.DoesNotExist:
            return Response({"error": "المعاملة غير موجودة"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


# =============================================================================
# 💡 LEARNING POINTS SUMMARY:
# =============================================================================
# 
# 1. PERMISSIONS:
#    - permission_classes = [] means anyone can access
#    - permission_classes = [IsAuthenticated] requires valid JWT
#    - Check request.user.is_staff for admin-only operations
#
# 2. CONTEXT IN SERIALIZERS:
#    - Pass context={'request': request} to get absolute URLs
#    - The serializer can then use request.build_absolute_uri()
#
# 3. HTTP METHODS:
#    - GET: Retrieve data
#    - POST: Create new resource
#    - PUT: Replace entire resource
#    - PATCH: Update partial fields
#    - DELETE: Remove resource
#
# 4. ERROR HANDLING:
#    - Use try/except for database operations
#    - Return appropriate status codes (400, 403, 404, etc.)
#    - Include helpful error messages (in Arabic for this app!)
# =============================================================================