from rest_framework.permissions import BasePermission
from plantform.models.enrollment import Enrollment
from django.contrib.auth import get_user_model

User = get_user_model()


class IsInstructorOwner(BasePermission):
    """Check if user is the course instructor (for Course objects)"""
    message = "You don't have permission to edit this course"

    def has_object_permission(self, request, view, obj):
        return obj.instructor == request.user


class IsModuleOwner(BasePermission):
    """Check if user is the course instructor (for Module objects)"""
    message = "You don't have permission to edit this module"

    def has_object_permission(self, request, view, obj):
        return obj.course.instructor == request.user


class IsLessonOwner(BasePermission):
    """Check if user is the course instructor (for Lesson objects)"""
    message = "You don't have permission to edit this lesson"

    def has_object_permission(self, request, view, obj):
        return obj.module.course.instructor == request.user


class IsEnrolledStudent(BasePermission):
    """Check if student is enrolled in the lesson's course"""
    message = "You must enroll in this course first"

    def has_object_permission(self, request, view, obj):
        return Enrollment.objects.filter(
            student=request.user, course=obj.module.course
        ).exists()


class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.INSTRUCTOR
        )


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role == User.Role.STUDENT
        )


class IsInstructorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.INSTRUCTOR
        )
