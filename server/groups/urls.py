from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('groups', views.GroupsViewSet, basename='groups')

app_name = 'groups'
urlpatterns = [
    path('my_groups/', views.get_user_own_groups, name='my-groups'),
    path('group/<int:pk>/members/', views.get_group_members, name='group-members'),
    path('admin_groups/', views.AdminGroupsView.as_view(), name='admin-groups'),
    path('admin_groups/<int:pk>/', views.AdminGroupDestroyView.as_view(), name='admin-groups-destroy'),
    path('', include(router.urls))
]
