# =============================================================================
# 📚 LIBRARY SERVICE - Business logic layer
# =============================================================================

from datetime import date, timedelta
from library.model.models import Book, Transaction


# Default borrow period in days
DEFAULT_BORROW_DAYS = 14


class LibraryService:
    """Service class for library operations."""
    
    @staticmethod
    def borrow_logic(user, book_id):
        """
        Borrow a book.
        
        Steps:
        1. Check if user already has this book borrowed
        2. Check if book is available (quantity > 0)
        3. Decrease quantity
        4. Create borrow transaction with expected_return_date (14 days default)
        """
        book = Book.objects.get(id=book_id)
        
        # Check if user already has this book borrowed
        existing_borrow = Transaction.objects.filter(
            user=user,
            book=book,
            action_type='borrow'
        ).exists()
        
        if existing_borrow:
            raise Exception("لديك هذا الكتاب مستعار بالفعل")  # "You already have this book borrowed"
        
        if book.quantity > 0:
            book.quantity -= 1
            book.save()
            
            # ✅ Calculate expected return date (14 days from today)
            expected_return = date.today() + timedelta(days=DEFAULT_BORROW_DAYS)
            
            return Transaction.objects.create(
                user=user, 
                book=book, 
                action_type='borrow',
                expected_return_date=expected_return  # ✅ NEW: Set the return date
            )
        raise Exception("الكتاب غير متوفر حالياً")  # "Book not available"

    @staticmethod
    def return_logic(user, book_id):
        """
        Return a borrowed book.
        
        Steps:
        1. Find the BORROW transaction for this user and book
        2. Increase book quantity
        3. DELETE the borrow transaction
        4. Create a return transaction for history
        """
        borrow_transaction = Transaction.objects.filter(
            user=user,
            book_id=book_id,
            action_type='borrow'
        ).first()

        if borrow_transaction:
            book = borrow_transaction.book
            
            book.quantity += 1
            book.save()
            
            # Create return record (no expected_return_date needed for returns)
            return_transaction = Transaction.objects.create(
                user=user, 
                book=book, 
                action_type='return'
            )
            
            # Delete the borrow transaction so it can't be returned again
            borrow_transaction.delete()
            
            return return_transaction
        
        raise Exception("لا توجد معاملة استعارة نشطة لهذا الكتاب")  # "No active borrow for this book"
    
    @staticmethod
    def extend_borrow(transaction_id, new_return_date):
        """
        ✅ NEW: Extend a borrow's return date.
        
        Args:
            transaction_id: ID of the borrow transaction
            new_return_date: New expected return date (date object or string)
        
        Returns:
            Updated transaction
        """
        transaction = Transaction.objects.get(id=transaction_id, action_type='borrow')
        
        # Convert string to date if needed
        if isinstance(new_return_date, str):
            new_return_date = date.fromisoformat(new_return_date)
        
        transaction.expected_return_date = new_return_date
        transaction.save()
        
        return transaction


# =============================================================================
# 💡 LEARNING POINTS:
# =============================================================================
# 
# 1. DEFAULT_BORROW_DAYS constant makes it easy to change the policy later
# 
# 2. date.today() + timedelta(days=14) calculates date 14 days from now
# 
# 3. The extend_borrow method now actually persists the new date!
# =============================================================================