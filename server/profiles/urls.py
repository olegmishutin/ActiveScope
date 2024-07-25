from django.urls import path
from . import views

app_name = 'profiles'
urlpatterns = [
    path('user/<str:email>/', views.UserProfileView.as_view(), name='user-profile')
]
