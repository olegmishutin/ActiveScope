from django_filters import rest_framework as filters


class MembersCountFilter(filters.FilterSet):
    min_members_count = filters.NumberFilter(field_name='members_count', lookup_expr='gte')
    max_members_count = filters.NumberFilter(field_name='members_count', lookup_expr='lte')
