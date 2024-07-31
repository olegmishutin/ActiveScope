from django.urls import path
from . import views

app_name = 'profiles'
urlpatterns = [
    path('users/', views.SearchUsersView.as_view(), name='users'),
    path('users/<int:pk>/', views.UserProfileView.as_view(), name='users-detail'),
    path('admin/users/', views.AdminSearchUsersView.as_view(), name='admin-users'),
]
