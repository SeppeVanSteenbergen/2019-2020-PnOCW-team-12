import os
import glob

props = [prop for prop in os.listdir(os.getcwd()) if os.path.isdir(prop)]
for prop in props:

    colors = os.listdir(os.path.join(os.getcwd(), prop))
    for color in colors:
        path = os.path.join(os.getcwd(), prop, color)

        images = [file for file in glob.glob(os.path.join(path, "**/*.jpg"), recursive=True)]
        names = [image.split("/")[-1] for image in images]
        used_names = [name for name in names if prop and color in name]
        old_names = [name for name in names if prop and color not in name]

        for old_name in old_names:
            i = 0
            new_name = prop + "_" + color + "_" + str(i) + ".jpg"

            while new_name in used_names:
                i += 1
                new_name = prop + "_" + color + "_" + str(i) + ".jpg"

            used_names.append(new_name)

            os.rename(os.path.join(path, old_name), os.path.join(path, new_name))
