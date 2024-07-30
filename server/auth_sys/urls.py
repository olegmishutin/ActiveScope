from django.urls import path
from . import views

app_name = 'auth_sys'
urlpatterns = [
    path('registration/', views.RegistrationView.as_view(), name='registration'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.short_user_info_view, name='short-user-info')
]
