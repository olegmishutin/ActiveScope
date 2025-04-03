from django.urls import path, include
from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from .consumer import GroupMessangerConsumer
from . import views

router = DefaultRouter()
router.register('groups', views.GroupsViewSet, basename='groups')

goup_messagenger_router = NestedDefaultRouter(router, 'groups', lookup='group')
goup_messagenger_router.register('messangers', views.GroupMessangerViewSet, basename='messangers')

goup_messagenger_messages_router = NestedDefaultRouter(goup_messagenger_router, 'messangers', lookup='messanger')
goup_messagenger_messages_router.register('messages', views.GroupMessangerMessageViewSet, basename='messages')

app_name = 'groups'
urlpatterns = [
    path('my_groups/', views.get_user_own_groups, name='my-groups'),
    path('admin_groups/', views.AdminGroupsView.as_view(), name='admin-groups'),
    path('admin_groups/<int:pk>/', views.AdminGroupDestroyView.as_view(), name='admin-groups-destroy'),
    path('', include(router.urls)),
    path('', include(goup_messagenger_router.urls)),
    path('', include(goup_messagenger_messages_router.urls))
]

group_websocket_urlpatterns = [
    path('ws/group_messanger/<int:messanger_id>/', GroupMessangerConsumer.as_asgi())
]
