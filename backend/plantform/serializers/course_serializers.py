from rest_framework import serializers
from plantform.models.course import Course
from plantform.models.module import Module
from plantform.models.lesson import Lesson
from plantform.models.enrollment import Enrollment
from django.db.models import Count, Sum


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ("id", "title", "content_markdown", "video_file", "order", "module")


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ("id", "title", "description", "order", "course", "lessons")


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    modules_count = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "description",
            "instructor",
            "instructor_name",
            "created_at",
            "modules",
            "modules_count",
            "lessons_count",
            "enrolled_count",
            "is_enrolled",
            "is_owner",
        )

    def get_instructor_name(self, obj):
        return obj.instructor.username

    def get_modules_count(self, obj):
        return obj.modules.count()

    def get_lessons_count(self, obj):
        return Lesson.objects.filter(module__course=obj).count()

    def get_enrolled_count(self, obj):
        return Enrollment.objects.filter(course=obj).count()

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Enrollment.objects.filter(student=request.user, course=obj).exists()

    def get_is_owner(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.instructor == request.user
