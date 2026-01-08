from plantform.models.course import Course
from plantform.models.user import User

class CourseService:
    @staticmethod
    def create_course(user, title, description):
        # تغيير الدور تلقائي إذا لم يكن معلم
        if user.role != User.Role.INSTRUCTOR:
            user.role = User.Role.INSTRUCTOR
            user.save(update_fields=["role"])
        return Course.objects.create(title=title, description=description, instructor=user)
