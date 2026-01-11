from plantform.models.lesson import Lesson
from django.core.exceptions import PermissionDenied

class LessonService:
    @staticmethod
    def create_lesson(user, module, title, content_markdown, order, video_file=None):
        if module.course.instructor != user:
            raise PermissionDenied("Not your course")
        return Lesson.objects.create(module=module, title=title, content_markdown=content_markdown,
                                     order=order, video_file=video_file)
