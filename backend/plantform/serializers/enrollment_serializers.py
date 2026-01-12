from rest_framework import serializers
from plantform.models.enrollment import Enrollment
from plantform.models.course import Course


class EnrollmentCourseSerializer(serializers.ModelSerializer):
    """Minimal course serializer for enrollment listings"""
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ("id", "title", "description", "instructor", "instructor_name", "created_at", "lessons_count")

    def get_lessons_count(self, obj):
        """Get total lesson count across all modules in this course"""
        from plantform.models.lesson import Lesson
        return Lesson.objects.filter(module__course=obj).count()


class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = EnrollmentCourseSerializer(source="course", read_only=True)
    completed_lessons = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Enrollment
        fields = ("id", "student", "course", "enrolled_at", "completed_lessons", "course_details")
