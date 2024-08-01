from django.db import models
from django.contrib.auth import get_user_model
from server.utils.functions.files import set_new_file, user_task_file_uploading_to


class UserTaskList(models.Model):
    user = models.OneToOneField(
        get_user_model(), related_name='task_list', verbose_name='пользователь', on_delete=models.CASCADE)

    header_image = models.ImageField('фоновая картинка', upload_to='users_task_list/', null=True, blank=True)

    class Meta:
        db_table = 'UserTaskList'
        verbose_name = 'Пользовательский список задач'
        verbose_name_plural = 'Пользовательские списки задач'

    def change_header_image(self, file):
        set_new_file(self, 'header_image', file)

    def __str__(self):
        return f'Задачник {self.user.email}'


class UserTaskListState(models.Model):
    name = models.CharField('название', max_length=128)
    color = models.CharField('цвет', max_length=6)

    class Meta:
        abstract = True


class UserTaskListStatus(UserTaskListState):
    task_list = models.ForeignKey(
        UserTaskList, related_name='statuses', verbose_name='список задач', on_delete=models.CASCADE)

    class Meta:
        db_table = 'UserTaskListStatus'
        verbose_name = 'Статус пользовательского списка задач'
        verbose_name_plural = 'Статусы пользовательских списков задач'

    def __str__(self):
        return f'Статус: {self.name}'


class UserTaskListPriority(UserTaskListState):
    task_list = models.ForeignKey(
        UserTaskList, related_name='priorities', verbose_name='список задач', on_delete=models.CASCADE)

    class Meta:
        db_table = 'UserTaskListPriority'
        verbose_name = 'Приоритет пользовательского списка задач'
        verbose_name_plural = 'Приоритеты пользовательских списков задач'

    def __str__(self):
        return f'Приоритет: {self.name}'


class UserTask(models.Model):
    task_list = models.ForeignKey(
        UserTaskList, related_name='tasks', verbose_name='список задач', on_delete=models.CASCADE)

    status = models.ForeignKey(
        UserTaskListStatus, related_name='tasks', verbose_name='статус', on_delete=models.SET_NULL, null=True,
        blank=True)

    priority = models.ForeignKey(
        UserTaskListPriority, related_name='tasks', verbose_name='приоритет', on_delete=models.SET_NULL, null=True,
        blank=True)

    name = models.CharField('название', max_length=128)
    start_date = models.DateField('дата начала', null=True, blank=True)
    end_date = models.DateField('дата окончания', null=True, blank=True)
    description = models.TextField('описание', null=True, blank=True)

    class Meta:
        db_table = 'UserTask'
        verbose_name = 'Пользовательская задача'
        verbose_name_plural = 'Пользовательские задачи'

    def __str__(self):
        return self.name


class UserTaskFile(models.Model):
    task = models.ForeignKey(UserTask, related_name='files', verbose_name='задача', on_delete=models.CASCADE)

    file = models.FileField('файл', upload_to=user_task_file_uploading_to)
    upload_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'UserTaskFile'
        verbose_name = 'Файл пользовательской задачи'
        verbose_name_plural = 'Файлы пользовательских задач'

    def change_file(self, file):
        set_new_file(self, 'file', file)

    def __str__(self):
        return self.file.path
