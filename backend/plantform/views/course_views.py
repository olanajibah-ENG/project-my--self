from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from plantform.models.course import Course
from plantform.serializers.course_serializers import CourseSerializer
from plantform.services.course_service import CourseService
from plantform.permissions import IsInstructorOwner, IsInstructor

class CourseViewSet(ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()

    def get_queryset(self):
        return Course.objects.prefetch_related("modules__lessons")

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    def get_permissions(self):
        if self.action == "create":
            self.permission_classes = [IsAuthenticated, IsInstructor]
        elif self.action in ["update","destroy"]:
            self.permission_classes = [IsAuthenticated, IsInstructorOwner]
        return super().get_permissions()
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Course deleted successfully"}, status=status.HTTP_200_OK)
