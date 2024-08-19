from django.db import models
from django.contrib.auth import get_user_model
from server.utils.functions import files
from server.utils.classes.models import TaskState


class Project(models.Model):
    owner = models.ForeignKey(
        get_user_model(), related_name='my_projects', verbose_name='основатель', on_delete=models.SET_NULL, null=True,
        blank=True)

    name = models.CharField('название', max_length=128)
    task_count = models.IntegerField('количесвто задач', default=0, editable=False)
    completed_task_count = models.IntegerField('количество выполненных задач', default=0, editable=False)

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

    def __str__(self):
        return self.name


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

    def __str__(self):
        return self.name


class ProjectTaskFile(models.Model):
    task = models.ForeignKey(ProjectTask, related_name='files', verbose_name='задача', on_delete=models.CASCADE)

    file = models.FileField('файл', upload_to=files.project_task_file_uploading_to)
    load_date = models.DateField('дата загрузки', auto_now_add=True, editable=False)

    class Meta:
        db_table = 'ProjectTaskFile'
        verbose_name = 'Файл задачи проекта'
        verbose_name_plural = 'Файлы задач проектов'

    def __str__(self):
        return self.file


class Comment(models.Model):
    task = models.ForeignKey(ProjectTask, related_name='comments', verbose_name='задача', on_delete=models.CASCADE)
    author = models.ForeignKey(
        get_user_model(), related_name='comments', verbose_name='автор', on_delete=models.CASCADE)

    date = models.DateField('дата', auto_now_add=True, editable=False)
    text = models.TextField('текст')

    likes = models.ManyToManyField(
        get_user_model(), related_name='liked_comments', verbose_name='лайки', db_table='LikedBy')

    class Meta:
        db_table = 'Comment'
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'

    def __str__(self):
        return self.text[:15]
