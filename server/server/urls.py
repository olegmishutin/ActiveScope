from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from groups.urls import group_websocket_urlpatterns
from projects.urls import projects_websocket_urlpatterns
from .consumer import SignalConsumer

api_urls = [
    path('', include('auth_sys.urls')),
    path('', include('profiles.urls')),
    path('', include('groups.urls')),
    path('', include('messages.urls')),
    path('', include('projects.urls')),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(), name='docs'),
]

urlpatterns = [
    path('api/', include(api_urls)),
    path('', include(static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)))
]

websocket_urlpatterns = [
    path('ws/signals/', SignalConsumer.as_asgi())
] + group_websocket_urlpatterns + projects_websocket_urlpatterns
