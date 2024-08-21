from django.urls import path, include
from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from . import views

router = DefaultRouter()
router.register('tasks', views.TasksViewSet, basename='task-list')
router.register('tasks_statuses', views.StatusesViewSet, basename='task-statuses')
router.register('tasks_priorities', views.PrioritiesViewSet, basename='tasks-priorities')

task_files = NestedDefaultRouter(router, 'tasks', lookup='task')
task_files.register('files', views.TaskFilesViewSet, basename='files')

app_name = 'user_tasks'
urlpatterns = [
    path('task_list/', views.TaskListView.as_view(), name='task-list'),
    path('', include(router.urls)),
    path('', include(task_files.urls))
]
