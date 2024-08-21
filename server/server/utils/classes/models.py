from django.db import models
from server.utils.functions.files import set_new_file, delete_old_files


class TaskState(models.Model):
    name = models.CharField('название', max_length=128)
    color = models.CharField('цвет', max_length=6)

    class Meta:
        abstract = True


class TaskFile(models.Model):
    file = None
    upload_date = models.DateTimeField('дата загрузки', auto_now_add=True, editable=False)

    class Meta:
        abstract = True

    def change_file(self, file):
        set_new_file(self, 'file', file)

    def delete(self, using=None, keep_parents=False):
        delete_old_files(self.file)
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.file.path
