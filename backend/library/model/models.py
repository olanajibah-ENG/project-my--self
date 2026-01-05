# =============================================================================
# 📚 LIBRARY MODELS - Database schema for the Library Management System
# =============================================================================

from django.db import models
from django.contrib.auth.models import User


class Book(models.Model):
    """
    Represents a book in the library.
    
    Fields:
    - title: Book title
    - author: Author name
    - quantity: Number of copies available
    - cover_image: Optional book cover image
    """
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    cover_image = models.ImageField(upload_to='books/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} by {self.author}"


class Transaction(models.Model):
    """
    Represents a borrow or return transaction.
    
    Fields:
    - user: The user who borrowed/returned
    - book: The book being borrowed/returned
    - action_type: 'borrow' or 'return'
    - date: When the transaction occurred (auto-set)
    - expected_return_date: ✅ NEW - When the book should be returned
    """
    ACTION_CHOICES = [
        ('borrow', 'Borrow'),
        ('return', 'Return')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=10, choices=ACTION_CHOICES)
    date = models.DateTimeField(auto_now_add=True)
    
    # ✅ NEW: Expected return date for borrow transactions
    # - Set automatically when borrowing (default: 14 days from borrow date)
    # - null/blank allowed for return transactions and legacy data
    expected_return_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.action_type} - {self.book.title}"
    
    class Meta:
        ordering = ['-date']  # Most recent first


# =============================================================================
# 💡 LEARNING POINTS:
# =============================================================================
# 
# 1. DateField vs DateTimeField:
#    - DateField: Just the date (2026-01-19)
#    - DateTimeField: Date + time (2026-01-19 14:30:00)
#    
#    For expected_return_date, DateField is enough - we don't need time.
#
# 2. null=True, blank=True:
#    - null=True: Database can store NULL
#    - blank=True: Form validation allows empty value
#    - Both needed for optional fields
#
# 3. After adding a field, you MUST run:
#    python manage.py makemigrations
#    python manage.py migrate
# =============================================================================