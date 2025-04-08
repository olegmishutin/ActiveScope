from django.db import models
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from server.utils.functions import files, websockets
from server.utils.classes.models import AbstractMessangerMessage


class Project(models.Model):
    owner = models.ForeignKey(
        get_user_model(), related_name='my_projects', verbose_name='основатель', on_delete=models.CASCADE)

    name = models.CharField('название', max_length=128, db_index=True)
    icon = models.ImageField('иконка', upload_to=files.project_image_uploading_to, null=True, blank=True)
    header_image = models.ImageField(
        'фоновая картинка', upload_to=files.project_image_uploading_to, null=True, blank=True)

    start_date = models.DateField('дата начала', null=True, blank=True)
    end_date = models.DateField('дата окончания', null=True, blank=True)
    description = models.TextField('описание', null=True, blank=True)

    members = models.ManyToManyField(
        get_user_model(), db_table='ProjectMembers', related_name='projects', verbose_name='участники')

    class Meta:
        db_table = 'Project'
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'

    def change_icon(self, file):
        files.set_new_file(self, 'icon', file)

    def change_header_image(self, file):
        files.set_new_file(self, 'header_image', file)

    def delete(self, using=None, keep_parents=False):
        files.delete_folder(f'projects/{self.id}')
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.name


class TaskState(models.Model):
    name = models.CharField('название', max_length=128)
    color = models.CharField('цвет', max_length=6)

    class Meta:
        abstract = True


class ProjectTaskStatus(TaskState):
    project = models.ForeignKey(Project, related_name='statuses', verbose_name='проект', on_delete=models.CASCADE)
    is_means_completeness = models.BooleanField('означает ли законченность')

    class Meta:
        db_table = 'ProjectTaskStatus'
        verbose_name = 'Статус задачи проекта'
        verbose_name_plural = 'Статусы задач проектов'

    def __str__(self):
        return f'Статус: {self.name}'


class ProjectTaskPriority(TaskState):
    project = models.ForeignKey(Project, related_name='priorities', verbose_name='проект', on_delete=models.CASCADE)

    class Meta:
        db_table = 'ProjectTaskPriority'
        verbose_name = 'Приоритет задачи проекта'
        verbose_name_plural = 'Приоритеты задач проектов'

    def __str__(self):
        return f'Приоритет: {self.name}'


class ProjectTask(models.Model):
    project = models.ForeignKey(Project, related_name='tasks', verbose_name='проект', on_delete=models.CASCADE)
    executor = models.ForeignKey(
        get_user_model(), related_name='projects_tasks', verbose_name='исполнитель', on_delete=models.SET_NULL,
        null=True, blank=True)

    status = models.ForeignKey(
        ProjectTaskStatus, related_name='tasks', verbose_name='статус', on_delete=models.SET_NULL, null=True,
        blank=True)

    priority = models.ForeignKey(
        ProjectTaskPriority, related_name='tasks', verbose_name='приоритет', on_delete=models.SET_NULL, null=True,
        blank=True)

    name = models.CharField('название', max_length=128)
    start_date = models.DateField('дата начала', null=True, blank=True)
    end_date = models.DateField('дата окончания', null=True, blank=True)
    description = models.TextField('описание', null=True, blank=True)

    class Meta:
        db_table = 'ProjectTask'
        verbose_name = 'Задача проекта'
        verbose_name_plural = 'Задачи проектов'

    def delete(self, using=None, keep_parents=False):
        files.delete_folder(f'projects/{self.project.id}/task_{self.id}')
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.name


class ProjectTaskFile(models.Model):
    task = models.ForeignKey(ProjectTask, related_name='files', verbose_name='задача', on_delete=models.CASCADE)
    file = models.FileField('файл', upload_to=files.project_task_file_uploading_to)
    upload_date = models.DateTimeField('дата загрузки', auto_now_add=True, editable=False)

    class Meta:
        db_table = 'ProjectTaskFile'
        verbose_name = 'Файл задачи проекта'
        verbose_name_plural = 'Файлы задач проектов'

    def change_file(self, file):
        files.set_new_file(self, 'file', file)

    def delete(self, using=None, keep_parents=False):
        files.delete_old_files(self.file)
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.file.path


class ProjectMessage(AbstractMessangerMessage):
    project = models.ForeignKey(
        Project, related_name='project_messages', verbose_name='проект', on_delete=models.CASCADE)

    sender = models.ForeignKey(
        get_user_model(), related_name='project_messages',
        verbose_name='отправитель', on_delete=models.CASCADE)

    class Meta:
        db_table = 'ProjectMessage'
        verbose_name = 'Сообщение проекта'
        verbose_name_plural = 'Сообщения проектов'

    def send_to_socket(self, content, action):
        channel_group = f'project_{self.project.id}_messages'

        async_to_sync(get_channel_layer().group_send)(
            channel_group, websockets.get_message(content, action)
        )

    def __str__(self):
        return f'Сообщение {self.id} проекта {self.project.name}'


class ProjectMessageFile(models.Model):
    message = models.ForeignKey(
        ProjectMessage, related_name='files', verbose_name='сообщение', on_delete=models.CASCADE)

    file = models.FileField('файл', upload_to=files.project_message_file_uploading_to)

    class Meta:
        db_table = 'ProjectMessageFile'
        verbose_name = 'Файл сообщения проекта'
        verbose_name_plural = 'Файлы сообщений проектов'

    def delete(self, using=None, keep_parents=False):
        files.delete_old_files(self.file)
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.file.path
