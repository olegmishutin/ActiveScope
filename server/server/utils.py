import os


def delete_existing_file(file):
    if os.path.exists(file.path):
        os.remove(file.path)
