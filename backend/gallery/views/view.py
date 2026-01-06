from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from gallery.serializers.serializer import AlbumSerializer, PhotoSerializer
from gallery.services.service import GalleryService
from gallery.models.model import Album

class AlbumView(APIView):
    def get(self, request):
        albums = Album.objects.all()
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get('title')
        if not title: return Response({"error": "Title is required"}, status=400)
        album = GalleryService.create_album(title)
        return Response(AlbumSerializer(album).data, status=201)

class PhotoUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def post(self, request):
        photo = GalleryService.upload_photo(
            album_id=request.data.get('album'),
            image_file=request.data.get('image'),
            caption=request.data.get('caption', '')
        )
        return Response(PhotoSerializer(photo).data, status=201)