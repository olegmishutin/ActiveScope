from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('messages', views.MessagesViewSet, basename='messages')

app_name = 'messages'
urlpatterns = [
    path('', include(router.urls)),
    path('new_messages_count/', views.new_messages_count_view, name='new-messages-count'),
    path('messages_topics/', views.messages_topics, name='messages-topics')
]
