from django.urls import path
from . import views

app_name = 'profiles'
urlpatterns = [
    path('user/<int:pk>/', views.UserProfileView.as_view(), name='user-profile')
]
