# Generated by Django 5.0.7 on 2025-03-24 18:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messages', '0006_alter_message_topic'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='topic',
            field=models.CharField(choices=[('INV_GROUP', 'Приглашение в группу'), ('JOINED_GROUP', 'Пополнение в группе'), ('EXC_GROUP', 'Исключен из группы'), ('LEAVE_GROUP', 'Убавление в группе'), ('EXC_PROJECT', 'Исключение из проекта'), ('LEAVE_PROJECT', 'Убавление в проекте'), ('TASKS', 'Уведомление о задаче')], editable=False, max_length=56, verbose_name='тема'),
        ),
    ]
