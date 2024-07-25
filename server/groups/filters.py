def filter_queryset_by_members_count(queryset, request):
    min_members_count = request.query_params.get('min_members')
    max_members_count = request.query_params.get('max_members')

    if min_members_count is not None:
        queryset = queryset.filter(members_count__gte=min_members_count)

    if max_members_count is not None:
        queryset = queryset.filter(members_count__lte=max_members_count)

    return queryset
