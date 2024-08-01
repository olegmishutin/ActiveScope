from django.urls import path
from . import views

app_name = 'messages'
urlpatterns = [
    path('messages/', views.MessagesListView.as_view(), name='messages'),
    path('messages/<int:pk>/', views.UpdatedMessageView.as_view(), name='updated-messages'),
    path('new_messages_count/', views.new_messages_count_view, name='new-messages-count'),
    path('messages_topics/', views.messages_topics, name='messages-topics')
]
