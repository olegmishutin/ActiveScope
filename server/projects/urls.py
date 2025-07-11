from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from django.urls import path, include
from .consumers import ProjectMessageConsumer
from . import views

router = DefaultRouter()
router.register('projects', views.ProjectsViewSet, basename='projects')
router.register('admin_projects', views.AdminProjectsViewSet, basename='admin_projects')

statuses_router = NestedDefaultRouter(router, 'projects', lookup='project')
statuses_router.register('statuses', views.StatusesViewSet, basename='project_statuses')

priorities_router = NestedDefaultRouter(router, 'projects', lookup='project')
priorities_router.register('priorities', views.PrioritiesViewSet, basename='project_priorities')

members_router = NestedDefaultRouter(router, 'projects', lookup='project')
members_router.register('members', views.MembersView, basename='project_members')

tasks_router = NestedDefaultRouter(router, 'projects', lookup='project')
tasks_router.register('tasks', views.TasksViewSet, basename='project_tasks')

task_files_router = NestedDefaultRouter(tasks_router, 'tasks', lookup='task')
task_files_router.register('files', views.TaskFilesViewSet, basename='project_task_files')

messages_router = NestedDefaultRouter(router, 'projects', lookup='project')
messages_router.register('messages', views.ProjectMessageViewSet, basename='project_messages')

messages_files_router = NestedDefaultRouter(messages_router, 'messages', lookup='message')
messages_files_router.register('files', views.ProjectMessageFileViewSet, basename='project_messages_files')

app_name = 'projects'
urlpatterns = [
    path('', include(router.urls)),
    path('', include(statuses_router.urls)),
    path('', include(priorities_router.urls)),
    path('', include(members_router.urls)),
    path('', include(tasks_router.urls)),
    path('', include(task_files_router.urls)),
    path('', include(messages_router.urls)),
    path('', include(messages_files_router.urls)),
    path('users/<int:user_id>/projects/', views.UserProjectsView.as_view(), name='user-projects'),
    path('admin_tasks/<int:task_pk>/', include([
        path('files/', views.AdminTasksFilesListView.as_view(), name='admin-task-files'),
    ])),
    path('admin_file/<int:pk>/', views.AdminFileView.as_view(), name='admin-file'),
    path('my_projects/', views.get_user_projects, name='user-projects')
]

projects_websocket_urlpatterns = [
    path('ws/project/<int:project_id>/messages/', ProjectMessageConsumer.as_asgi())
]
