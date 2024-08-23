from django_filters import rest_framework as filters
from server.utils.classes.filters import TasksFilter as BaseTasksFilter, NumberInFilter


class TaskFilter(BaseTasksFilter):
    executor = NumberInFilter(field_name='executor', lookup_expr='in')


class TasksCountFilter(filters.FilterSet):
    min_tasks_count = filters.NumberFilter(field_name='total_tasks', lookup_expr='gte')
    max_tasks_count = filters.NumberFilter(field_name='total_tasks', lookup_expr='lte')
