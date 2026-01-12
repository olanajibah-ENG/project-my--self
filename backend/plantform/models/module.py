from django.db import models
from plantform.models.course import Course

class Module(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    order = models.PositiveIntegerField()
    course = models.ForeignKey(Course, related_name="modules", on_delete=models.CASCADE)

    class Meta:
        ordering = ["order"]
