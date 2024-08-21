import os


def user_file_uploading_to(instance, file):
    return f'{instance.email}/profile/{file}'


def user_task_file_uploading_to(instance, file):
    return f'{instance.task.task_list.user.email}/task_{instance.task.id}_files/{file}'


def project_image_uploading_to(instance, file):
    return f'projects/{instance.id}/info/{file}'


def project_task_file_uploading_to(instance, file):
    return f'projects/{instance.task.project.id}/task_{instance.task.id}/{file}'


def delete_old_files(*args):
    for file in args:
        if file and os.path.exists(file.path):
            os.remove(file.path)


def set_new_file(model, field_name, file):
    if file is not None:
        delete_old_files(getattr(model, field_name))
        setattr(model, field_name, file)
