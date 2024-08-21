from server.utils.classes.filters import TasksFilter as BaseTasksFilter, NumberInFilter


class TaskFilter(BaseTasksFilter):
    executor = NumberInFilter(field_name='executor', lookup_expr='in')
