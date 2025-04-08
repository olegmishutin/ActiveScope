import os
import shutil
from django.conf import settings


def user_file_uploading_to(instance, file):
    return f'{instance.email}/profile/{file}'


def project_image_uploading_to(instance, file):
    return f'projects/{instance.id}/info/{file}'


def project_task_file_uploading_to(instance, file):
    return f'projects/{instance.task.project.id}/task_{instance.task.id}/{file}'


def group_image_uploading_to(instance, file):
    return f'groups/{instance.id}/{file}'


def group_messanger_image_uploading_to(instance, file):
    return f'groups/{instance.group.id}/messanger/{instance.id}/{file}'


def group_messanger_message_file_uploading_to(instance, file):
    return f'groups/{instance.message.messanger.group.id}/messanger/{instance.message.messanger.id}/files/{file}'


def project_message_file_uploading_to(instance, file):
    return f'projects/{instance.message.project.id}/messages_files/{file}'


def delete_old_files(*args):
    for file in args:
        if file and os.path.exists(file.path):
            os.remove(file.path)


def set_new_file(model, field_name, file):
    if file is not None:
        delete_old_files(getattr(model, field_name))
        setattr(model, field_name, file)


def delete_folder(path):
    path = f'{settings.MEDIA_ROOT}/{path}'

    if os.path.exists(path):
        shutil.rmtree(path)


def delete_files_by_related(queryset, related_file_name):
    for obj in queryset:
        path = getattr(obj, related_file_name).path

        if os.path.exists(path):
            os.remove(path)
