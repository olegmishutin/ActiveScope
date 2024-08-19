from django.db import models


class TaskState(models.Model):
    name = models.CharField('название', max_length=128)
    color = models.CharField('цвет', max_length=6)

    class Meta:
        abstract = True
