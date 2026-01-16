from django.db import models
from plantform.models.module import Module

class Lesson(models.Model):
    title = models.CharField(max_length=255)
    content_markdown = models.TextField(blank=True, default='')
    video_file = models.FileField(upload_to="lesson_videos/", null=True, blank=True, max_length=255)
    order = models.PositiveIntegerField()
    module = models.ForeignKey(Module, related_name="lessons", on_delete=models.CASCADE)

    class Meta:
        ordering = ["order"]
