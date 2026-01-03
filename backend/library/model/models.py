from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    cover_image = models.ImageField(upload_to='books/', null=True, blank=True)

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=10, choices=[('borrow', 'Borrow'), ('return', 'Return')])
    date = models.DateTimeField(auto_now_add=True)