from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from groups.urls import group_websocket_urlpatterns

api_urls = [
    path('', include('auth_sys.urls')),
    path('', include('profiles.urls')),
    path('', include('groups.urls')),
    path('', include('messages.urls')),
    path('', include('projects.urls')),
]

urlpatterns = [
    path('api/', include(api_urls)),
    path('', include(static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)))
]

websocket_urlpatterns = []
websocket_urlpatterns.extend(
    group_websocket_urlpatterns
)
