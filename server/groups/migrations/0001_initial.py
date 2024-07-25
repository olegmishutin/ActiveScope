# Generated by Django 5.0.7 on 2024-07-25 14:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Group',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('icon', models.ImageField(blank=True, null=True, upload_to='groups/', verbose_name='иконка')),
                ('name', models.CharField(db_index=True, max_length=128, unique=True, verbose_name='название')),
                ('created_date', models.DateField(auto_now_add=True, verbose_name='дата создания')),
                ('members_count', models.IntegerField(default=0, editable=False, verbose_name='количество участников')),
                ('description', models.TextField(blank=True, null=True, verbose_name='описание')),
                ('founder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='my_groups', to=settings.AUTH_USER_MODEL, verbose_name='основатель')),
                ('members', models.ManyToManyField(db_table='UserGroup', related_name='groups', to=settings.AUTH_USER_MODEL, verbose_name='участники')),
            ],
            options={
                'verbose_name': 'Группа',
                'verbose_name_plural': 'Группы',
                'db_table': 'Group',
            },
        ),
    ]
