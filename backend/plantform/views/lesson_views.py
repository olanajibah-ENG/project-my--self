from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import NotFound
from plantform.models.lesson import Lesson
from plantform.serializers.course_serializers import LessonSerializer
from plantform.services.lesson_service import LessonService
from plantform.permissions import IsInstructor
from plantform.models.enrollment import Enrollment
from plantform.services.enrollment_service import EnrollmentService

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    queryset = Lesson.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return Lesson.objects.all()

        if getattr(user, "role", None) == "instructor":
            return Lesson.objects.filter(module__course__instructor=user)

        enrolled_course_ids = Enrollment.objects.filter(student=user).values_list("course_id", flat=True)
        return Lesson.objects.filter(module__course_id__in=enrolled_course_ids)

    def get_permissions(self):
        if self.action in ["create", "update", "destroy"]:
            self.permission_classes = [IsAuthenticated, IsInstructor]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "message": "Lessons retrieved successfully",
                "results": serializer.data,
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "message": "Lessons retrieved successfully",
            "count": queryset.count(),
            "results": serializer.data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="markdown")
    def markdown(self, request, *args, **kwargs):
        lesson = self.get_object()
        return Response({"content_markdown": lesson.content_markdown}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="video")
    def video(self, request, *args, **kwargs):
        lesson = self.get_object()
        if lesson.video_file:
            return Response({"video_file": lesson.video_file.url}, status=status.HTTP_200_OK)
        return Response({"video_file": None}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, *args, **kwargs):
        lesson_id = kwargs.get("pk")
        try:
            lesson = Lesson.objects.select_related("module__course").get(pk=lesson_id)
        except Lesson.DoesNotExist:
            raise NotFound("No Lesson matches the given query.")
        try:
            EnrollmentService.mark_lesson_completed(request.user, lesson)
        except Exception as exc:
            # EnrollmentService raises django.core.exceptions.PermissionDenied
            raise PermissionDenied(str(exc))

        return Response({
            "message": "Lesson marked as completed",
            "lesson_id": lesson.id,
        }, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Lesson deleted successfully"}, status=status.HTTP_200_OK)
