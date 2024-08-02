from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('tasks', views.TasksViewSet, basename='task-list')
router.register('tasks_statuses', views.StatusesViewSet, basename='task-statuses')
router.register('tasks_priorities', views.PrioritiesViewSet, basename='tasks-priorities')

app_name = 'user_tasks'
urlpatterns = [
    path('task_list/', views.TaskListView.as_view(), name='task-list'),
    path('tasks/<int:task_id>/files/', views.TaskFilesView.as_view(), name='task-files'),
    path('tasks/<int:task_id>/files/<int:pk>/', views.TaskFilesDetailView.as_view(), name='task-files-detail'),
    path('', include(router.urls))
]
