import os
import glob

dirs = [name for name in os.listdir(os.getcwd()) if os.path.isdir(name)]
for dir in dirs:
    path = os.path.join(os.getcwd(), dir)
    images = [file for file in glob.glob(os.path.join(path, "**/*.txt"), recursive=True)]
    names = [image.split("/")[-1] for image in images]
    used_names = [name for name in names if dir in name]
    old_names = [name for name in names if dir not in name]

    for old_name in old_names:
        i = 0
        new_name = dir + "_" + str(i) + ".txt"

        while new_name in used_names:
            i += 1
            new_name = dir + "_" + str(i) + ".txt"

        used_names.append(new_name)

        os.rename(os.path.join(path, old_name), os.path.join(path, new_name))
