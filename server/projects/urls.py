from rest_framework_nested import routers
from django.urls import path, include
from . import views

router = routers.SimpleRouter()
router.register('projects', views.ProjectsViewSet, basename='projects')

statuses_router = routers.NestedSimpleRouter(router, 'projects', lookup='project')
statuses_router.register('statuses', views.StatusesViewSet, basename='statuses')

priorities_router = routers.NestedSimpleRouter(router, 'projects', lookup='project')
priorities_router.register('priorities', views.PrioritiesViewSet, basename='priorities')

app_name = 'projects'
urlpatterns = [
    path('', include(router.urls)),
    path('', include(statuses_router.urls)),
    path('', include(priorities_router.urls))
]
