# =============================================================================
# 🌐 MAIN URL CONFIGURATION
# =============================================================================
# 
# ⚠️ ISSUE FOUND: Media files were being served under /api/media/ because
#    the static() helper was inside library/urls.py which is included under /api/
# 
# ✅ FIX: Move media serving to the main urls.py so files are at /media/
#    NOT under /api/media/
# =============================================================================

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def test_view(request):
    return JsonResponse({"message": "Test successful"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('test/', test_view),  # للتحقق
    path('api/', include('library.urls')),  # API endpoints under /api/
]

# =============================================================================
# ✅ FIX: Serve media files at /media/ (not /api/media/)
# =============================================================================
# 
# In development, Django needs to serve media files.
# This adds a URL pattern like: /media/<path> → MEDIA_ROOT/<path>
# 
# ⚠️ Previous code had this in library/urls.py which made it /api/media/
#    That's wrong because media files are not part of the API!
# 
# 💡 NOTE: In production, you'd use nginx/Apache to serve media,
#    not Django. This is only for development.
# =============================================================================

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)