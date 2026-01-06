from django.urls import path
from .views.view import AlbumView, PhotoUploadView

urlpatterns = [
    path('albums/', AlbumView.as_view()),
    path('upload/', PhotoUploadView.as_view()),
]