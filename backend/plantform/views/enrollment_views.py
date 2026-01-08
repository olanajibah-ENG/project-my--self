from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from plantform.models.course import Course
from plantform.services.enrollment_service import EnrollmentService
from plantform.serializers.course_serializers import CourseSerializer
from plantform.models.enrollment import Enrollment
from plantform.serializers.course_serializers import LessonSerializer

class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        enrollment = EnrollmentService.enroll(request.user, course)
        return Response({
            "message": "Enrolled successfully",
            "enrollment": {
                "id": enrollment.id,
                "student": enrollment.student_id,
                "course": enrollment.course_id,
                "enrolled_at": enrollment.enrolled_at,
            },
            "course": CourseSerializer(course).data,
        }, status=status.HTTP_200_OK)


class CompletedLessonsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).prefetch_related("completed_lessons")
        lessons = []
        seen = set()
        for enrollment in enrollments:
            for lesson in enrollment.completed_lessons.all():
                if lesson.id in seen:
                    continue
                seen.add(lesson.id)
                lessons.append(lesson)

        serializer = LessonSerializer(lessons, many=True)
        return Response({
            "message": "Completed lessons retrieved successfully",
            "count": len(lessons),
            "results": serializer.data,
        }, status=status.HTTP_200_OK)
