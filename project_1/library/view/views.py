from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from library.serializer.serializers import UserRegisterSerializer, BookSerializer
from library.service.services import LibraryService
from library.model.models import Book

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "تم التسجيل بنجاح"}, status=201)
        return Response(serializer.errors, status=400)

class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, book_id):
        print(f"BorrowBookView called with book_id: {book_id}, user: {request.user}")
        try:
            transaction = LibraryService.borrow_logic(request.user, book_id)
            return Response({"msg": "تمت الاستعارة"}, status=200)
        except Exception as e:
            print(f"Error in BorrowBookView: {e}")
            return Response({"error": str(e)}, status=400)

class BookListView(APIView):
    def get(self, request):
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data, status=200)

    def post(self, request):
        # إنشاء كتاب جديد (Admin only)
        if not request.user.is_staff:
            return Response({"error": "غير مسموح - مطلوب صلاحيات مدير"}, status=403)

        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class BookDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        try:
            book = Book.objects.get(id=book_id)
            serializer = BookSerializer(book)
            return Response(serializer.data, status=200)
        except Book.DoesNotExist:
            return Response({"error": "الكتاب غير موجود"}, status=404)

    def put(self, request, book_id):
        # تعديل كتاب (Admin only)
        if not request.user.is_staff:
            return Response({"error": "غير مسموح - مطلوب صلاحيات مدير"}, status=403)

        try:
            book = Book.objects.get(id=book_id)
            serializer = BookSerializer(book, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        except Book.DoesNotExist:
            return Response({"error": "الكتاب غير موجود"}, status=404)

    def delete(self, request, book_id):
        # حذف كتاب (Admin only)
        if not request.user.is_staff:
            return Response({"error": "غير مسموح - مطلوب صلاحيات مدير"}, status=403)

        try:
            book = Book.objects.get(id=book_id)
            book.delete()
            return Response({"message": "تم حذف الكتاب بنجاح"}, status=204)
        except Book.DoesNotExist:
            return Response({"error": "الكتاب غير موجود"}, status=404)

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        try:
            transaction = LibraryService.return_logic(request.user, book_id)
            return Response({"msg": "تم إرجاع الكتاب بنجاح"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)