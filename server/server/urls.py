from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

api_urls = [
    path('', include('auth_sys.urls')),
    path('', include('profiles.urls')),
    path('', include('groups.urls')),
    path('', include('messages.urls')),
    path('', include('user_tasks.urls')),
]

urlpatterns = [
    path('api/', include(api_urls)),
    path('', include(static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)))
]
