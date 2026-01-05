# =============================================================================
# 📝 SERIALIZERS - Convert Django models to/from JSON
# =============================================================================

from rest_framework import serializers
from django.contrib.auth.models import User
from library.model.models import Book, Transaction


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class BookSerializer(serializers.ModelSerializer):
    """
    Serializer for Book model.
    Returns absolute URL for cover_image.
    """
    cover_image = serializers.ImageField(
        required=False,
        allow_null=True,
        allow_empty_file=True
    )
    
    class Meta:
        model = Book
        fields = '__all__'
    
    def to_representation(self, instance):
        """Return absolute URL for cover_image."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        if data.get('cover_image') and request:
            data['cover_image'] = request.build_absolute_uri(data['cover_image'])
        return data


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for Transaction model.
    
    ⚠️ ISSUE FOUND: Frontend TransactionCard expects:
       - transaction.book.title, transaction.book.author
       - transaction.user.username, transaction.user.email
       - transaction.borrowDate, transaction.expectedReturnDate
    
    ✅ FIX: Include all necessary nested fields for admin display.
    """
    # Book info
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    book_cover = serializers.SerializerMethodField()
    
    # ⚠️ NEW: User info - needed for TransactionCard display
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id',
            'user_id',
            'user_username',
            'user_email',
            'book_id',
            'book_title',
            'book_author', 
            'book_cover',
            'action_type',
            'date',
            'expected_return_date'  # ✅ NEW: Include the return date
        ]
    
    def get_book_cover(self, obj):
        """Return absolute URL for book cover image."""
        if obj.book and obj.book.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.book.cover_image.url)
            return obj.book.cover_image.url
        return None


# =============================================================================
# 💡 LEARNING POINTS:
# =============================================================================
# 
# 1. NESTED DATA FOR FRONTEND:
#    When frontend components expect nested objects like:
#       transaction.book.title
#       transaction.user.username
#    
#    The serializer must provide these fields, either as:
#    - Flat fields: book_title, user_username
#    - Nested objects: book: { title, author }, user: { username, email }
#
# 2. SOURCE ATTRIBUTE:
#    source='user.username' tells DRF to get the value from
#    the related User model's username field.
#
# 3. REQUEST CONTEXT:
#    Always pass context={'request': request} when instantiating
#    serializers in views to enable absolute URL generation.
# =============================================================================