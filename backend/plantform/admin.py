from django.contrib import admin
from plantform.models.user import User
from plantform.models.course import Course
from plantform.models.module import Module
from plantform.models.lesson import Lesson
from plantform.models.enrollment import Enrollment

# -----------------
# User Admin
# -----------------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email")

# -----------------
# Course Admin
# -----------------
class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "instructor", "created_at")
    search_fields = ("title", "instructor__username")
    inlines = [ModuleInline]

# -----------------
# Module Admin
# -----------------
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "order")
    search_fields = ("title", "course__title")
    inlines = [LessonInline]

# -----------------
# Lesson Admin
# -----------------
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "module", "order", "video_file")
    search_fields = ("title", "module__title")

# -----------------
# Enrollment Admin
# -----------------
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "course", "enrolled_at")
    search_fields = ("student__username", "course__title")
    filter_horizontal = ("completed_lessons",)
