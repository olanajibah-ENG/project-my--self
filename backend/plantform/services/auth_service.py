from django.contrib.auth import get_user_model

User = get_user_model()

class AuthService:
    @staticmethod
    def register_user(username, email, password, role):
        # التأكد من أن الدور صالح
        if role not in [User.Role.STUDENT, User.Role.INSTRUCTOR]:
            role = User.Role.STUDENT
        
        return User.objects.create_user(username=username, email=email, password=password, role=role)
