from rest_framework import serializers
from django.contrib.auth.models import User
from library.model.models import Book

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    def create(self, validated_data):
        return User.objects.create_user(**validated_data) 

class BookSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=False) 

    class Meta:
        model = Book
        fields = '__all__'