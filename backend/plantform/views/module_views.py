from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from plantform.models.module import Module
from plantform.models.course import Course
from plantform.serializers.course_serializers import ModuleSerializer
from plantform.permissions import IsInstructor, IsModuleOwner
from plantform.models.enrollment import Enrollment


class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    queryset = Module.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["course"]

    def get_queryset(self):
        user = self.request.user
        queryset = Module.objects.all()

        # Apply course filter if provided
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course_id=course_id)

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return queryset

        if getattr(user, "role", None) == "instructor":
            return queryset.filter(course__instructor=user)

        enrolled_course_ids = Enrollment.objects.filter(student=user).values_list(
            "course_id", flat=True
        )
        return queryset.filter(course_id__in=enrolled_course_ids)

    def get_permissions(self):
        if self.action in ["create", "reorder"]:
            self.permission_classes = [IsAuthenticated, IsInstructor]
        elif self.action in ["update", "partial_update", "destroy"]:
            self.permission_classes = [IsAuthenticated, IsModuleOwner]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(
                {
                    "message": "Modules retrieved successfully",
                    "results": serializer.data,
                }
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "message": "Modules retrieved successfully",
                "count": queryset.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        if course.instructor != self.request.user:
            raise PermissionDenied("You can only create modules for your own courses")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Module deleted successfully"}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request):
        course_id = request.data.get("course")
        module_ids = request.data.get("module_ids", [])

        if not course_id or not module_ids:
            return Response(
                {"error": "course and module_ids are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if course.instructor != request.user:
            raise PermissionDenied("You can only reorder modules in your own courses")

        # Update order for each module
        for index, module_id in enumerate(module_ids):
            Module.objects.filter(id=module_id, course=course).update(order=index)

        return Response(
            {"message": "Modules reordered successfully"}, status=status.HTTP_200_OK
        )
