from rest_framework import serializers
from gallery.models.model import Album, Photo

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ['id', 'album', 'image', 'caption']

class AlbumSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    class Meta:
        model = Album
        fields = ['id', 'title', 'photos', 'created_at']