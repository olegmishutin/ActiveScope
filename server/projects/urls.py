from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views

router = DefaultRouter()
router.register('projects', views.Projects, basename='projects')

app_name = 'projects'
urlpatterns = router.urls
