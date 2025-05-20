import os
import uuid
import shutil
from django.conf import settings


def generate_file_name(file):
    file, ext = os.path.splitext(file)
    return f'{uuid.uuid4().hex}{ext}'


def user_file_uploading_to(instance, file):
    return f'{instance.email}/profile/{generate_file_name(file)}'


def project_image_uploading_to(instance, file):
    return f'projects/{instance.id}/info/{generate_file_name(file)}'


def project_task_file_uploading_to(instance, file):
    return f'projects/{instance.task.project.id}/task_{instance.task.id}/{generate_file_name(file)}'


def group_image_uploading_to(instance, file):
    return f'groups/{instance.id}/{generate_file_name(file)}'


def group_messanger_image_uploading_to(instance, file):
    return f'groups/{instance.group.id}/messanger/{instance.id}/{generate_file_name(file)}'


def group_messanger_message_file_uploading_to(instance, file):
    return (
        f'groups/{instance.message.messanger.group.id}/messanger/{instance.message.messanger.id}/'
        f'files/{generate_file_name(file)}'
    )


def project_message_file_uploading_to(instance, file):
    return f'projects/{instance.message.project.id}/messages_files/{generate_file_name(file)}'


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
