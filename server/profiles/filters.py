from django_filters import rest_framework as filters

class ProjectsCountFilter(filters.FilterSet):
    min_projects_count = filters.NumberFilter(field_name='projects_count', lookup_expr='gte')
    max_projects_count = filters.NumberFilter(field_name='projects_count', lookup_expr='lte')