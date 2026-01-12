# Backend-Frontend Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align OlaLearn backend API with frontend expectations and fix role-based UI issues.

**Architecture:** Backend-first approach. Add missing endpoints, enhance serializers with computed fields, add query filtering, then fix frontend role-based UI. All changes maintain existing patterns.

**Tech Stack:** Django 6.0, DRF 3.16, django-filter, React 18, TypeScript, Axios

---

## Task 1: Add django-filter Dependency

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/requirements.txt`
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/edupro/settings.py`

**Step 1: Add django-filter to requirements.txt**

```bash
echo "django-filter==24.3" >> /Users/mbalkhi/Desktop/OlaProject/backend/requirements.txt
```

**Step 2: Install the dependency**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && pip install django-filter==24.3
```

Expected: Successfully installed django-filter

**Step 3: Add to INSTALLED_APPS in settings.py**

In `/Users/mbalkhi/Desktop/OlaProject/backend/edupro/settings.py`, add `'django_filters'` to INSTALLED_APPS (after line 42):

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_filters',  # Add this line
    'corsheaders',
    'plantform'
]
```

**Step 4: Add DEFAULT_FILTER_BACKENDS to REST_FRAMEWORK settings**

In the same file, update REST_FRAMEWORK (around line 113):

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
}
```

**Step 5: Verify server starts**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python manage.py check
```

Expected: System check identified no issues.

**Step 6: Commit**

```bash
git add requirements.txt edupro/settings.py
git commit -m "feat: add django-filter for query param filtering"
```

---

## Task 2: Enhance CourseSerializer with Computed Fields

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/serializers/course_serializers.py`

**Step 1: Update CourseSerializer with computed fields**

Replace the entire file content:

```python
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
```

**Step 2: Verify no syntax errors**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.serializers.course_serializers import CourseSerializer; print('OK')"
```

Expected: OK

**Step 3: Test via shell**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python manage.py shell -c "
from plantform.models.course import Course
from plantform.serializers.course_serializers import CourseSerializer
from rest_framework.test import APIRequestFactory
factory = APIRequestFactory()
request = factory.get('/')
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.first()
if user:
    request.user = user
    course = Course.objects.first()
    if course:
        serializer = CourseSerializer(course, context={'request': request})
        data = serializer.data
        assert 'instructor_name' in data
        assert 'modules_count' in data
        assert 'is_owner' in data
        print('All fields present:', list(data.keys()))
    else:
        print('No courses in DB yet - OK')
else:
    print('No users in DB yet - OK')
"
```

**Step 4: Commit**

```bash
git add plantform/serializers/course_serializers.py
git commit -m "feat: add computed fields to CourseSerializer

Adds instructor_name, modules_count, lessons_count, enrolled_count,
is_enrolled, and is_owner fields for role-based UI"
```

---

## Task 3: Add Query Filtering to CourseViewSet

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/course_views.py`

**Step 1: Update CourseViewSet with filtering**

Replace the entire file content:

```python
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from plantform.models.course import Course
from plantform.serializers.course_serializers import CourseSerializer
from plantform.services.course_service import CourseService
from plantform.permissions import IsInstructorOwner, IsInstructor


class CourseViewSet(ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Course.objects.all()
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = Course.objects.prefetch_related("modules__lessons")

        # Filter by my_courses=true for instructors
        my_courses = self.request.query_params.get("my_courses")
        if my_courses and my_courses.lower() == "true":
            queryset = queryset.filter(instructor=self.request.user)

        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    def get_permissions(self):
        if self.action == "create":
            self.permission_classes = [IsAuthenticated, IsInstructor]
        elif self.action in ["update", "partial_update", "destroy"]:
            self.permission_classes = [IsAuthenticated, IsInstructorOwner]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Course deleted successfully"}, status=status.HTTP_200_OK)
```

**Step 2: Verify import works**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.views.course_views import CourseViewSet; print('OK')"
```

Expected: OK

**Step 3: Commit**

```bash
git add plantform/views/course_views.py
git commit -m "feat: add my_courses filter to CourseViewSet"
```

---

## Task 4: Add Query Filtering to ModuleViewSet

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/module_views.py`

**Step 1: Update ModuleViewSet with course filtering and reorder action**

Replace the entire file content:

```python
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from plantform.models.module import Module
from plantform.models.course import Course
from plantform.serializers.course_serializers import ModuleSerializer
from plantform.permissions import IsInstructor
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
        if self.action in ["create", "update", "partial_update", "destroy", "reorder"]:
            self.permission_classes = [IsAuthenticated, IsInstructor]
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
```

**Step 2: Verify import works**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.views.module_views import ModuleViewSet; print('OK')"
```

Expected: OK

**Step 3: Commit**

```bash
git add plantform/views/module_views.py
git commit -m "feat: add course filter and reorder action to ModuleViewSet"
```

---

## Task 5: Add Query Filtering and Reorder to LessonViewSet

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/lesson_views.py`

**Step 1: Update LessonViewSet with module filtering, reorder, and DELETE complete**

Replace the entire file content:

```python
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
from plantform.permissions import IsInstructor
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
        if self.action in ["create", "update", "partial_update", "destroy", "reorder"]:
            self.permission_classes = [IsAuthenticated, IsInstructor]
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
```

**Step 2: Verify import works**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.views.lesson_views import LessonViewSet; print('OK')"
```

Expected: OK

**Step 3: Commit**

```bash
git add plantform/views/lesson_views.py
git commit -m "feat: add module filter, reorder, and DELETE complete to LessonViewSet"
```

---

## Task 6: Add unmark_lesson_completed to EnrollmentService

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/services/enrollment_service.py`

**Step 1: Add unmark method**

Replace the entire file content:

```python
from plantform.models.enrollment import Enrollment
from django.core.exceptions import PermissionDenied


class EnrollmentService:
    @staticmethod
    def enroll(student, course):
        enrollment, _ = Enrollment.objects.get_or_create(student=student, course=course)
        return enrollment

    @staticmethod
    def mark_lesson_completed(student, lesson):
        enrollment = Enrollment.objects.filter(
            student=student, course=lesson.module.course
        ).first()
        if not enrollment:
            raise PermissionDenied("Not enrolled")
        enrollment.completed_lessons.add(lesson)

    @staticmethod
    def unmark_lesson_completed(student, lesson):
        enrollment = Enrollment.objects.filter(
            student=student, course=lesson.module.course
        ).first()
        if not enrollment:
            raise PermissionDenied("Not enrolled")
        enrollment.completed_lessons.remove(lesson)
```

**Step 2: Verify import works**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.services.enrollment_service import EnrollmentService; print('OK')"
```

Expected: OK

**Step 3: Commit**

```bash
git add plantform/services/enrollment_service.py
git commit -m "feat: add unmark_lesson_completed to EnrollmentService"
```

---

## Task 7: Create EnrollmentViewSet for Listing Enrollments

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/enrollment_views.py`
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/serializers/enrollment_serializers.py`
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/urls.py`

**Step 1: Update EnrollmentSerializer with nested course details**

Replace `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/serializers/enrollment_serializers.py`:

```python
from rest_framework import serializers
from plantform.models.enrollment import Enrollment
from plantform.models.course import Course


class EnrollmentCourseSerializer(serializers.ModelSerializer):
    """Minimal course serializer for enrollment listings"""
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)

    class Meta:
        model = Course
        fields = ("id", "title", "description", "instructor", "instructor_name", "created_at")


class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = EnrollmentCourseSerializer(source="course", read_only=True)
    completed_lessons = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Enrollment
        fields = ("id", "student", "course", "enrolled_at", "completed_lessons", "course_details")
```

**Step 2: Update enrollment_views.py with EnrollmentViewSet**

Replace `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/enrollment_views.py`:

```python
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
```

**Step 3: Update urls.py to register EnrollmentViewSet**

Replace `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from plantform.views.auth_views import RegisterView, LoginView
from plantform.views.course_views import CourseViewSet
from plantform.views.module_views import ModuleViewSet
from plantform.views.lesson_views import LessonViewSet
from plantform.views.enrollment_views import EnrollView, CompletedLessonsView, EnrollmentViewSet

router = DefaultRouter()
router.register("courses", CourseViewSet)
router.register("modules", ModuleViewSet)
router.register("lessons", LessonViewSet)
router.register("enrollments", EnrollmentViewSet, basename="enrollment")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("courses/<int:course_id>/enroll/", EnrollView.as_view()),
    path("progress/completed-lessons/", CompletedLessonsView.as_view()),
    path("", include(router.urls)),
]
```

**Step 4: Verify imports work**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.urls import urlpatterns; print('OK')"
```

Expected: OK

**Step 5: Commit**

```bash
git add plantform/views/enrollment_views.py plantform/serializers/enrollment_serializers.py plantform/urls.py
git commit -m "feat: add EnrollmentViewSet for listing enrollments with course filter"
```

---

## Task 8: Add Email to JWT Login Response

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/serializers/auth_serializers.py`

**Step 1: Add email to CustomTokenSerializer**

Replace the entire file:

```python
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = ("username", "email", "password", "role")


class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info to response
        data["username"] = self.user.username
        data["email"] = self.user.email
        data["role"] = self.user.role
        data["user_id"] = self.user.id
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        token["user_id"] = user.id
        return token


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Get user from the refresh token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken(attrs["refresh"])
        user_id = refresh.payload.get("user_id")
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                data["username"] = user.username
                data["email"] = user.email
                data["role"] = user.role
                data["user_id"] = user.id
            except User.DoesNotExist:
                pass
        return data
```

**Step 2: Update auth_views to use new refresh serializer**

Read and update `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/auth_views.py`:

```python
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from plantform.serializers.auth_serializers import RegisterSerializer, CustomTokenSerializer, CustomTokenRefreshSerializer
from plantform.services.auth_service import AuthService


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = AuthService.register_user(**serializer.validated_data)
            return Response({
                "message": "User created successfully",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
```

**Step 3: Update urls.py to use CustomTokenRefreshView**

In `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/urls.py`, update the refresh import and path:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from plantform.views.auth_views import RegisterView, LoginView, CustomTokenRefreshView
from plantform.views.course_views import CourseViewSet
from plantform.views.module_views import ModuleViewSet
from plantform.views.lesson_views import LessonViewSet
from plantform.views.enrollment_views import EnrollView, CompletedLessonsView, EnrollmentViewSet

router = DefaultRouter()
router.register("courses", CourseViewSet)
router.register("modules", ModuleViewSet)
router.register("lessons", LessonViewSet)
router.register("enrollments", EnrollmentViewSet, basename="enrollment")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", CustomTokenRefreshView.as_view()),
    path("courses/<int:course_id>/enroll/", EnrollView.as_view()),
    path("progress/completed-lessons/", CompletedLessonsView.as_view()),
    path("", include(router.urls)),
]
```

**Step 4: Verify imports work**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.urls import urlpatterns; print('OK')"
```

Expected: OK

**Step 5: Commit**

```bash
git add plantform/serializers/auth_serializers.py plantform/views/auth_views.py plantform/urls.py
git commit -m "feat: add email to login response and user data to refresh response"
```

---

## Task 9: Add Ownership Permissions to Module/Lesson Updates

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/permissions.py`
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/module_views.py`
- Modify: `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/lesson_views.py`

**Step 1: Add module and lesson ownership permissions**

Replace `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/permissions.py`:

```python
from rest_framework.permissions import BasePermission
from plantform.models.enrollment import Enrollment
from django.contrib.auth import get_user_model

User = get_user_model()


class IsInstructorOwner(BasePermission):
    """Check if user is the course instructor (for Course objects)"""
    message = "You don't have permission to edit this course"

    def has_object_permission(self, request, view, obj):
        return obj.instructor == request.user


class IsModuleOwner(BasePermission):
    """Check if user is the course instructor (for Module objects)"""
    message = "You don't have permission to edit this module"

    def has_object_permission(self, request, view, obj):
        return obj.course.instructor == request.user


class IsLessonOwner(BasePermission):
    """Check if user is the course instructor (for Lesson objects)"""
    message = "You don't have permission to edit this lesson"

    def has_object_permission(self, request, view, obj):
        return obj.module.course.instructor == request.user


class IsEnrolledStudent(BasePermission):
    """Check if student is enrolled in the lesson's course"""
    message = "You must enroll in this course first"

    def has_object_permission(self, request, view, obj):
        return Enrollment.objects.filter(
            student=request.user, course=obj.module.course
        ).exists()


class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.INSTRUCTOR
        )


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.role == User.Role.STUDENT
        )


class IsInstructorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.INSTRUCTOR
        )
```

**Step 2: Update ModuleViewSet to use IsModuleOwner**

In `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/module_views.py`, update the import and get_permissions:

Add to imports:
```python
from plantform.permissions import IsInstructor, IsModuleOwner
```

Update get_permissions method:
```python
def get_permissions(self):
    if self.action in ["create", "reorder"]:
        self.permission_classes = [IsAuthenticated, IsInstructor]
    elif self.action in ["update", "partial_update", "destroy"]:
        self.permission_classes = [IsAuthenticated, IsModuleOwner]
    return super().get_permissions()
```

**Step 3: Update LessonViewSet to use IsLessonOwner**

In `/Users/mbalkhi/Desktop/OlaProject/backend/plantform/views/lesson_views.py`, update the import and get_permissions:

Add to imports:
```python
from plantform.permissions import IsInstructor, IsLessonOwner
```

Update get_permissions method:
```python
def get_permissions(self):
    if self.action in ["create", "reorder"]:
        self.permission_classes = [IsAuthenticated, IsInstructor]
    elif self.action in ["update", "partial_update", "destroy"]:
        self.permission_classes = [IsAuthenticated, IsLessonOwner]
    return super().get_permissions()
```

**Step 4: Verify imports work**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python -c "from plantform.permissions import IsModuleOwner, IsLessonOwner; print('OK')"
```

Expected: OK

**Step 5: Commit**

```bash
git add plantform/permissions.py plantform/views/module_views.py plantform/views/lesson_views.py
git commit -m "feat: add ownership permissions for modules and lessons"
```

---

## Task 10: Update Frontend Types

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform/src/types/index.ts`

**Step 1: Add is_enrolled and is_owner to Course interface**

Replace the Course interface (lines 10-20):

```typescript
export interface Course {
  id: number
  title: string
  description: string
  instructor: number
  instructor_name?: string
  created_at: string
  modules_count?: number
  lessons_count?: number
  enrolled_count?: number
  is_enrolled?: boolean
  is_owner?: boolean
  modules?: Module[]
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && npx tsc --noEmit
```

Expected: No errors (or only existing unrelated errors)

**Step 3: Commit**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && git add src/types/index.ts
git commit -m "feat: add is_enrolled and is_owner fields to Course type"
```

---

## Task 11: Fix CourseDetail Role-Based UI

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform/src/pages/student/CourseDetail.tsx`

**Step 1: Update CourseDetail to show Edit for owners**

Replace the sidebar section (lines 120-156) with:

```tsx
{/* Sidebar */}
<div className="lg:col-span-1">
  <div className="sticky top-24 bg-white rounded-xl border p-6">
    {course.is_owner ? (
      <>
        <p className="text-gray-600 mb-4">
          You are the instructor of this course
        </p>
        <Link to={`/instructor/courses/${courseId}/edit`}>
          <Button className="w-full">
            Edit Course
          </Button>
        </Link>
      </>
    ) : isEnrolled ? (
      <>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Your progress</span>
            <span>{getProgress(totalLessons)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 transition-all"
              style={{ width: `${getProgress(totalLessons)}%` }}
            />
          </div>
        </div>
        <Button onClick={handleContinue} className="w-full">
          Continue Learning
        </Button>
      </>
    ) : (
      <>
        <p className="text-gray-600 mb-4">
          Enroll in this course to start learning
        </p>
        <Button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="w-full"
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
        </Button>
      </>
    )}
  </div>
</div>
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/pages/student/CourseDetail.tsx
git commit -m "fix: show Edit button for course owners instead of Enroll"
```

---

## Task 12: Add Ownership Check to CourseBuilder

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform/src/pages/instructor/CourseBuilder.tsx`

**Step 1: Add ownership validation after fetching course**

Add useAuth import at the top:
```tsx
import { useAuth } from '@/context/AuthContext'
```

Add inside the component (after line 16):
```tsx
const { user } = useAuth()
```

Update fetchCourseData to check ownership (around line 47-58):

```tsx
const fetchCourseData = useCallback(async () => {
  if (!id) return

  try {
    setIsLoading(true)
    setError(null)

    // Fetch course - it includes modules with lessons from the backend serializer
    const courseData = await courseService.getCourse(id)

    // Check ownership
    if (courseData.instructor !== user?.id) {
      setError("You don't have permission to edit this course")
      return
    }

    setCourse(courseData)

    // Use modules from course response, or empty array if none
    const modulesWithLessons = (courseData.modules || []).map(module => ({
      ...module,
      lessons: module.lessons || []
    }))

    setModules(modulesWithLessons)
  } catch (err) {
    setError('Failed to load course data')
    console.error(err)
  } finally {
    setIsLoading(false)
  }
}, [id, user?.id])
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/pages/instructor/CourseBuilder.tsx
git commit -m "fix: add ownership check to CourseBuilder"
```

---

## Task 13: Add Enrollment Check to LearningView

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform/src/pages/student/LearningView.tsx`

**Step 1: Add enrollment and ownership validation**

Add imports:
```tsx
import { useAuth } from '@/context/AuthContext'
import { useEnrollment } from '@/hooks/useEnrollment'
```

Add inside the component (after line 16):
```tsx
const { user } = useAuth()
const { isEnrolled, isLoading: enrollmentLoading } = useEnrollment(courseId)
```

Update isLoading:
```tsx
const isLoadingAll = isLoading || enrollmentLoading
```

Add access check after loading (before the return with course content, around line 74):

```tsx
// Check access - must be enrolled or be the instructor
const hasAccess = course?.is_owner || isEnrolled

if (!isLoadingAll && course && !hasAccess) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 mb-4">You need to enroll in this course to access the lessons.</p>
        <Link to={`/courses/${courseId}`}>
          <Button>View Course Details</Button>
        </Link>
      </div>
    </div>
  )
}
```

Update the loading check to use isLoadingAll:
```tsx
if (isLoadingAll) {
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/pages/student/LearningView.tsx
git commit -m "fix: add enrollment check to LearningView"
```

---

## Task 14: Update Token Refresh Handler to Sync User Data

**Files:**
- Modify: `/Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform/src/lib/api.ts`

**Step 1: Update response interceptor to sync user data on refresh**

Replace the token refresh section (lines 35-42):

```tsx
try {
  const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
    refresh: refreshToken,
  })
  const { access, username, email, role, user_id } = response.data
  localStorage.setItem('access_token', access)

  // Sync user data if returned from refresh
  if (role && user_id) {
    const userData = { id: user_id, username, email, role }
    localStorage.setItem('user', JSON.stringify(userData))
  }

  originalRequest.headers.Authorization = `Bearer ${access}`
  return api(originalRequest)
} catch (refreshError) {
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/lib/api.ts
git commit -m "fix: sync user data on token refresh"
```

---

## Task 15: Final Integration Test

**Step 1: Start backend server**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/backend && python manage.py runserver 8001
```

**Step 2: Start frontend dev server (in another terminal)**

```bash
cd /Users/mbalkhi/Desktop/OlaProject/.worktrees/olalearn-rebrand/frontend/plantform && npm run dev
```

**Step 3: Manual test checklist**

1. Register as instructor - verify email in response
2. Create a course - verify is_owner=true in response
3. View course detail - verify "Edit Course" button shows
4. Register as student (new browser/incognito)
5. View same course - verify "Enroll Now" shows
6. Enroll in course - verify enrollment succeeds
7. View course again - verify "Continue Learning" shows
8. Access learning view - verify lessons load
9. Mark lesson complete - verify it persists
10. Unmark lesson complete - verify it removes

**Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: complete backend-frontend alignment

- Added django-filter for query param filtering
- Enhanced CourseSerializer with computed fields
- Added EnrollmentViewSet for listing enrollments
- Added module/lesson reorder endpoints
- Added DELETE method for unmarking lesson complete
- Added email to login/refresh responses
- Added ownership permissions for modules/lessons
- Fixed CourseDetail role-based UI
- Added ownership check to CourseBuilder
- Added enrollment check to LearningView
- Updated token refresh to sync user data"
```

---

## Summary

| Task | Description | Files Modified |
|------|-------------|----------------|
| 1 | Add django-filter | requirements.txt, settings.py |
| 2 | Enhance CourseSerializer | course_serializers.py |
| 3 | Add course filtering | course_views.py |
| 4 | Add module filtering + reorder | module_views.py |
| 5 | Add lesson filtering + reorder + DELETE complete | lesson_views.py |
| 6 | Add unmark method | enrollment_service.py |
| 7 | Add EnrollmentViewSet | enrollment_views.py, enrollment_serializers.py, urls.py |
| 8 | Add email to JWT | auth_serializers.py, auth_views.py, urls.py |
| 9 | Add ownership permissions | permissions.py, module_views.py, lesson_views.py |
| 10 | Update frontend types | types/index.ts |
| 11 | Fix CourseDetail UI | CourseDetail.tsx |
| 12 | Add CourseBuilder ownership check | CourseBuilder.tsx |
| 13 | Add LearningView enrollment check | LearningView.tsx |
| 14 | Sync user on token refresh | api.ts |
| 15 | Integration test | - |
