import openpyxl
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


wb = openpyxl.Workbook()
sheet = wb.active
sheet.title = "results"
sheet.cell(1, 1, "Id")
sheet.cell(1, 2, "Original color")
sheet.cell(1, 8, "Environment")
sheet.cell(1, 9, "Light")
sheet.cell(1, 10, "Brightness")
sheet.cell(1, 11, "no blur score")
sheet.cell(1, 12, "gaussian blur score")
sheet.cell(1, 13, "median blur score")
sheet.cell(1, 14, "mean blur score")
sheet.cell(1, 15, "fastNM denoising score")


path = os.getcwd()
files = [file for file in glob.glob(os.path.join(path, "**/*.jpg"), recursive=True)]
for i in range(len(files)):
    file = files[i]
    originalColor = file.split("/")[-1].split(".")[0].split("_")[-2]
    R, G, B = prep_image(file)

    sheet.cell(i + 2, 1, i)
    sheet.cell(i + 2, 2, originalColor)

file = os.path.join(os.getcwd(), "test.xls")
wb.save(file)
