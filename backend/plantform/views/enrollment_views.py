from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from plantform.models.course import Course
from plantform.models.enrollment import Enrollment
from plantform.services.enrollment_service import EnrollmentService
from plantform.serializers.course_serializers import CourseSerializer, LessonSerializer
from plantform.serializers.enrollment_serializers import EnrollmentSerializer


class EnrollmentViewSet(ReadOnlyModelViewSet):
    """ViewSet for listing user enrollments"""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["course"]

    def get_queryset(self):
        user = self.request.user

        # Instructors see enrollments for their courses
        if getattr(user, "role", None) == "instructor":
            return Enrollment.objects.filter(course__instructor=user).select_related(
                "course", "course__instructor"
            ).prefetch_related("completed_lessons")

        # Students see only their own enrollments
        return Enrollment.objects.filter(student=user).select_related(
            "course", "course__instructor"
        ).prefetch_related("completed_lessons")


class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {"detail": "You are already enrolled in this course"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        enrollment = EnrollmentService.enroll(request.user, course)
        return Response(
            {
                "message": "Enrolled successfully",
                "enrollment": {
                    "id": enrollment.id,
                    "student": enrollment.student_id,
                    "course": enrollment.course_id,
                    "enrolled_at": enrollment.enrolled_at,
                },
                "course": CourseSerializer(course, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )


class CompletedLessonsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).prefetch_related(
            "completed_lessons"
        )
        lessons = []
        seen = set()
        for enrollment in enrollments:
            for lesson in enrollment.completed_lessons.all():
                if lesson.id in seen:
                    continue
                seen.add(lesson.id)
                lessons.append(lesson)

        serializer = LessonSerializer(lessons, many=True)
        return Response(
            {
                "message": "Completed lessons retrieved successfully",
                "count": len(lessons),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
