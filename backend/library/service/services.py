from library.model.models import Book, Transaction

class LibraryService:
    @staticmethod
    def borrow_logic(user, book_id):
        book = Book.objects.get(id=book_id)
        if book.quantity > 0:
            book.quantity -= 1
            book.save()
            return Transaction.objects.create(user=user, book=book, action_type='borrow')
        raise Exception("الكتاب غير متوفر حالياً")

    @staticmethod
    def return_logic(user, book_id):
        # البحث عن معاملة استعارة نشطة لهذا الكتاب والمستخدم
        transaction = Transaction.objects.filter(
            user=user,
            book_id=book_id,
            action_type='borrow'
        ).first()

        if transaction:
            book = transaction.book
            book.quantity += 1
            book.save()
            # إنشاء معاملة إرجاع
            Transaction.objects.create(user=user, book=book, action_type='return')
            return transaction
        raise Exception("لا توجد معاملة استعارة نشطة لهذا الكتاب")