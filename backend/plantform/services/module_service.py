from plantform.models.module import Module
from django.core.exceptions import PermissionDenied

class ModuleService:
    @staticmethod
    def create_module(user, course, title, order):
        if course.instructor != user:
            raise PermissionDenied("Not your course")
        return Module.objects.create(course=course, title=title, order=order)
