from rest_framework import serializers
from plantform.models.course import Course
from plantform.models.module import Module
from plantform.models.lesson import Lesson

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
    instructor = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Course
        fields = ("id", "title", "description", "instructor", "created_at", "modules")
