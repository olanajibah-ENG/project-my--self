from gallery.models.model import Album, Photo

class GalleryService:
    @staticmethod
    def create_album(title):
        return Album.objects.create(title=title)

    @staticmethod
    def upload_photo(album_id, image_file, caption):
        album = Album.objects.get(id=album_id)
        return Photo.objects.create(album=album, image=image_file, caption=caption)