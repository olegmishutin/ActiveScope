# Generated by Django 5.0.7 on 2024-08-19 12:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='completed_task_count',
            field=models.IntegerField(default=0, editable=False, verbose_name='количество выполненных задач'),
        ),
        migrations.AlterField(
            model_name='project',
            name='task_count',
            field=models.IntegerField(default=0, editable=False, verbose_name='количесвто задач'),
        ),
    ]
