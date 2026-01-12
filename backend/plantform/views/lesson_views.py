from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, NotFound
from django_filters.rest_framework import DjangoFilterBackend
from plantform.models.lesson import Lesson
from plantform.models.module import Module
from plantform.serializers.course_serializers import LessonSerializer
from plantform.permissions import IsInstructor, IsLessonOwner
from plantform.models.enrollment import Enrollment
from plantform.services.enrollment_service import EnrollmentService


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    queryset = Lesson.objects.all()
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["module"]

    def get_queryset(self):
        user = self.request.user
        queryset = Lesson.objects.all()

        # Apply module filter if provided
        module_id = self.request.query_params.get("module")
        if module_id:
            queryset = queryset.filter(module_id=module_id)

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return queryset

        if getattr(user, "role", None) == "instructor":
            return queryset.filter(module__course__instructor=user)

        enrolled_course_ids = Enrollment.objects.filter(student=user).values_list(
            "course_id", flat=True
        )
        return queryset.filter(module__course_id__in=enrolled_course_ids)

    def get_permissions(self):
        if self.action in ["create", "reorder"]:
            self.permission_classes = [IsAuthenticated, IsInstructor]
        elif self.action in ["update", "partial_update", "destroy"]:
            self.permission_classes = [IsAuthenticated, IsLessonOwner]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {
                    "message": "Lessons retrieved successfully",
                    "results": serializer.data,
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Lessons retrieved successfully",
                "count": queryset.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="markdown")
    def markdown(self, request, *args, **kwargs):
        lesson = self.get_object()
        return Response(
            {"content_markdown": lesson.content_markdown}, status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["get"], url_path="video")
    def video(self, request, *args, **kwargs):
        lesson = self.get_object()
        if lesson.video_file:
            return Response(
                {"video_file": lesson.video_file.url}, status=status.HTTP_200_OK
            )
        return Response({"video_file": None}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post", "delete"], url_path="complete")
    def complete(self, request, *args, **kwargs):
        lesson_id = kwargs.get("pk")
        try:
            lesson = Lesson.objects.select_related("module__course").get(pk=lesson_id)
        except Lesson.DoesNotExist:
            raise NotFound("No Lesson matches the given query.")

        if request.method == "POST":
            try:
                EnrollmentService.mark_lesson_completed(request.user, lesson)
            except Exception as exc:
                raise PermissionDenied(str(exc))

            return Response(
                {
                    "message": "Lesson marked as completed",
                    "lesson_id": lesson.id,
                },
                status=status.HTTP_200_OK,
            )

        elif request.method == "DELETE":
            try:
                EnrollmentService.unmark_lesson_completed(request.user, lesson)
            except Exception as exc:
                raise PermissionDenied(str(exc))

            return Response(
                {
                    "message": "Lesson unmarked as completed",
                    "lesson_id": lesson.id,
                },
                status=status.HTTP_200_OK,
            )

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request):
        module_id = request.data.get("module")
        lesson_ids = request.data.get("lesson_ids", [])

        if not module_id or not lesson_ids:
            return Response(
                {"error": "module and lesson_ids are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            module = Module.objects.select_related("course").get(id=module_id)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if module.course.instructor != request.user:
            raise PermissionDenied("You can only reorder lessons in your own courses")

        # Update order for each lesson
        for index, lesson_id in enumerate(lesson_ids):
            Lesson.objects.filter(id=lesson_id, module=module).update(order=index)

        return Response(
            {"message": "Lessons reordered successfully"}, status=status.HTTP_200_OK
        )

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Lesson deleted successfully"}, status=status.HTTP_200_OK
        )
