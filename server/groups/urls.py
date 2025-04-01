from django.urls import path, include
from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from . import views

router = DefaultRouter()
router.register('groups', views.GroupsViewSet, basename='groups')

goup_messagenger_router = NestedDefaultRouter(router, 'groups', lookup='group')
goup_messagenger_router.register('messangers', views.GroupMessangerViewSet, basename='messangers')

app_name = 'groups'
urlpatterns = [
    path('my_groups/', views.get_user_own_groups, name='my-groups'),
    path('admin_groups/', views.AdminGroupsView.as_view(), name='admin-groups'),
    path('admin_groups/<int:pk>/', views.AdminGroupDestroyView.as_view(), name='admin-groups-destroy'),
    path('', include(router.urls)),
    path('', include(goup_messagenger_router.urls))
]
