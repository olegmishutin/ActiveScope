from django_filters import rest_framework as filters
from server.utils.classes.filters import NumberInFilter


class TaskFilter(filters.FilterSet):
    executor = NumberInFilter(field_name='executor', lookup_expr='in')

    status = NumberInFilter(field_name='status', lookup_expr='in')
    priority = NumberInFilter(field_name='priority', lookup_expr='in')

    start_date = filters.DateFilter(field_name='start_date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='end_date', lookup_expr='lte')


class TasksCountFilter(filters.FilterSet):
    min_tasks_count = filters.NumberFilter(field_name='total_tasks', lookup_expr='gte')
    max_tasks_count = filters.NumberFilter(field_name='total_tasks', lookup_expr='lte')
