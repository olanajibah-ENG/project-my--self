from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from plantform.views.auth_views import RegisterView, LoginView
from plantform.views.course_views import CourseViewSet
from plantform.views.module_views import ModuleViewSet
from plantform.views.lesson_views import LessonViewSet
from plantform.views.enrollment_views import EnrollView, CompletedLessonsView

router = DefaultRouter()
router.register("courses", CourseViewSet)
router.register("modules", ModuleViewSet)
router.register("lessons", LessonViewSet)

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("courses/<int:course_id>/enroll/", EnrollView.as_view()),
    path("progress/completed-lessons/", CompletedLessonsView.as_view()),
    path("", include(router.urls)),
]
