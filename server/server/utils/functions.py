import os


def delete_old_files(*args):
    for file in args:
        if file and os.path.exists(file.path):
            os.remove(file.path)


def set_new_file(old, new):
    if new is not None:
        delete_old_files(old)
        return new
    return old
