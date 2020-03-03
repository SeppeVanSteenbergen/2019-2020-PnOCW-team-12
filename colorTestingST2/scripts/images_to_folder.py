import os
import glob

colors = ["White", "Red", "Yellow", "Green", "BlueGreen", "Blue", "Pink", "Black"]
two_same_colors = True
images = [file for file in glob.glob(os.path.join(os.getcwd(), "**/*.jpg"), recursive=True)]
images.sort()

for color1 in colors:
    for color2 in colors:
        if not two_same_colors:
            if color1 == color2:
                continue

        color = color1 + "_" + color2
        new_path = os.path.join(os.getcwd(), color)
        os.mkdir(new_path)

        image = images.pop(0)
        name = image.split("/")[-1]
        os.rename(os.path.join(os.getcwd(), name), os.path.join(new_path, name))
