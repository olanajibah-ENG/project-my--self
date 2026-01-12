from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")


class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info to response
        data["username"] = self.user.username
        data["email"] = self.user.email
        data["role"] = self.user.role
        data["user_id"] = self.user.id
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        token["user_id"] = user.id
        return token


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Get user from the refresh token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken(attrs["refresh"])
        user_id = refresh.payload.get("user_id")
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                data["username"] = user.username
                data["email"] = user.email
                data["role"] = user.role
                data["user_id"] = user.id
            except User.DoesNotExist:
                pass
        return data
