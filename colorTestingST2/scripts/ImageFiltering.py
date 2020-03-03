import colorsys
import cv2
import glob
import os
import sys

import numpy as np


def rgb_to_hsl(r, g, b):
    hue = []
    saturation = []
    lightness = []

    for r, g, b in zip(r, g, b):
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)

        hue.append(h * 360)
        saturation.append(s * 100)
        lightness.append(l * 100)

    return hue, saturation, lightness


def prep_image(file):
    image = cv2.imread(file)
    row, column, channels = image.shape
    top_left = [int(row * (2 / 5)), int(column * (2 / 5))]
    bottom_right = [int(row * (3 / 5)), int(column * (3 / 5))]
    cropped_image = image[top_left[0]:bottom_right[0], top_left[1]:bottom_right[1], :]

    b, g, r = cv2.split(cropped_image)

    return r, g, b


path = os.getcwd()

files = [file for file in glob.glob(os.path.join(path, "**/*.jpg"), recursive=True)]
for file in files:
    R, G, B = prep_image(file)
    # H, S, L = rgb_to_hsl(R, G, B)
    # print(H, S, L)
