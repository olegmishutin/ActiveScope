from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register('projects', views.ProjectsViewSet, basename='projects')

statuses_router = NestedDefaultRouter(router, 'projects', lookup='project')
statuses_router.register('statuses', views.StatusesViewSet, basename='statuses')

priorities_router = NestedDefaultRouter(router, 'projects', lookup='project')
priorities_router.register('priorities', views.PrioritiesViewSet, basename='priorities')

members_router = NestedDefaultRouter(router, 'projects', lookup='project')
members_router.register('members', views.MembersView, basename='members')

tasks_router = NestedDefaultRouter(router, 'projects', lookup='project')
tasks_router.register('tasks', views.TasksViewSet, basename='tasks')

task_files_router = NestedDefaultRouter(tasks_router, 'tasks', lookup='task')
task_files_router.register('files', views.TaskFilesViewSet, basename='files')

app_name = 'projects'
urlpatterns = [
    path('', include(router.urls)),
    path('', include(statuses_router.urls)),
    path('', include(priorities_router.urls)),
    path('', include(members_router.urls)),
    path('', include(tasks_router.urls)),
    path('', include(task_files_router.urls))
]
