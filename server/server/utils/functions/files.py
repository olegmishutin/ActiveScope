import os


def user_file_uploading_to(instance, file):
    return f'{instance.email}/profile/{file}'


def delete_old_files(*args):
    for file in args:
        if file and os.path.exists(file.path):
            os.remove(file.path)


def set_new_file(model, field, file):
    if file is not None:
        delete_old_files(getattr(model, field))
        setattr(model, field, file)
