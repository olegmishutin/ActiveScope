from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('tasks', views.TasksViewSet, basename='task-list')
router.register(r'tasks_statuses', views.StatusesViewSet, basename='task-statuses')

app_name = 'user_tasks'
urlpatterns = router.urls
