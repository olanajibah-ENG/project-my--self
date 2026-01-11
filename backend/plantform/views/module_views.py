from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from plantform.models.module import Module
from plantform.serializers.course_serializers import ModuleSerializer
from plantform.services.module_service import ModuleService
from plantform.permissions import IsInstructor
from plantform.models.enrollment import Enrollment

class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]
    queryset = Module.objects.all()

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "is_superuser", False) or getattr(user, "is_staff", False):
            return Module.objects.all()

        if getattr(user, "role", None) == "instructor":
            return Module.objects.filter(course__instructor=user)

        enrolled_course_ids = Enrollment.objects.filter(student=user).values_list("course_id", flat=True)
        return Module.objects.filter(course_id__in=enrolled_course_ids)

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
                "message": "Modules retrieved successfully",
                "results": serializer.data,
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "message": "Modules retrieved successfully",
            "count": queryset.count(),
            "results": serializer.data,
        }, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        if course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create modules for your own courses")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Module deleted successfully"}, status=status.HTTP_200_OK)
