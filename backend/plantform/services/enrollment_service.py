from plantform.models.enrollment import Enrollment
from django.core.exceptions import PermissionDenied

class EnrollmentService:
    @staticmethod
    def enroll(student, course):
        enrollment, _ = Enrollment.objects.get_or_create(student=student, course=course)
        return enrollment

    @staticmethod
    def mark_lesson_completed(student, lesson):
        enrollment = Enrollment.objects.filter(
            student=student, course=lesson.module.course
        ).first()
        if not enrollment:
            raise PermissionDenied("Not enrolled")
        enrollment.completed_lessons.add(lesson)

    @staticmethod
    def unmark_lesson_completed(student, lesson):
        enrollment = Enrollment.objects.filter(
            student=student, course=lesson.module.course
        ).first()
        if not enrollment:
            raise PermissionDenied("Not enrolled")
        enrollment.completed_lessons.remove(lesson)