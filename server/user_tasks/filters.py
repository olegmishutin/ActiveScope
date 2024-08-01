from django_filters import rest_framework as filters
from server.utils.classes.filters_fields import NumberInFilter


class TasksFilter(filters.FilterSet):
    status = NumberInFilter(field_name='status', lookup_expr='in')
    priority = NumberInFilter(field_name='priority', lookup_expr='in')

    start_date = filters.DateFilter(field_name='start_date', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='end_date', lookup_expr='lte')
