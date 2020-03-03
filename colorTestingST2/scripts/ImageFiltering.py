import time

import openpyxl
import colorsys
import cv2
import glob
import os

from colorTestingST2.scripts import score


def rgb_to_hsl(red, green, blue):
    hue = []
    saturation = []
    lightness = []

    for red, green, blue in zip(red, green, blue):
        h, l, s = colorsys.rgb_to_hls(red / 255, green / 255, blue / 255)

        hue.append(h * 360)
        saturation.append(s * 100)
        lightness.append(l * 100)

    return hue, saturation, lightness


def cut_image(file):
    image = cv2.imread(file)
    row, column, channels = image.shape
    top_left = [int(row * (2 / 5)), int(column * (2 / 5))]
    bottom_right = [int(row * (3 / 5)), int(column * (3 / 5))]
    return image[top_left[0]:bottom_right[0], top_left[1]:bottom_right[1], :]


def addToExcell(shet, iid, orColor, Env, Light, Brightness, nbSc, GBsc, GBt, MBs, MBt, MeanBs, MeanBt, FDs, FDt, blocknb):
    shet.cell(iid + 2, 1, iid)
    shet.cell(iid + 2, 2, orColor)
    shet.cell(iid + 2, 3, Env)
    shet.cell(iid + 2, 4, Light)
    shet.cell(iid + 2, 5, Brightness)
    shet.cell(iid + 2, 6, nbSc)
    shet.cell(iid + 2, 7, GBsc)
    shet.cell(iid + 2, 8, GBt)
    shet.cell(iid + 2, 9, MBs)
    shet.cell(iid + 2, 10, MBt)
    shet.cell(iid + 2, 11, MeanBs)
    shet.cell(iid + 2, 12, MeanBt)
    shet.cell(iid + 2, 13, FDs)
    shet.cell(iid + 2, 14, FDt)
    shet.cell(iid + 2, 15, blocknb)


wb = openpyxl.Workbook()
sheet = wb.active
sheet.title = "results"
sheet.cell(1, 1, "Id")
sheet.cell(1, 2, "Original color")
sheet.cell(1, 3, "Environment")
sheet.cell(1, 4, "Light")
sheet.cell(1, 5, "Brightness")
sheet.cell(1, 6, "no blur score")
sheet.cell(1, 7, "gaussian blur score")
sheet.cell(1, 8, "gaussian blur time")
sheet.cell(1, 9, "median blur score")
sheet.cell(1, 10, "median blur time")
sheet.cell(1, 11, "mean blur score")
sheet.cell(1, 12, "mean blur time")
sheet.cell(1, 13, "fastNM denoising score")
sheet.cell(1, 14, "fastNM denoising time")
sheet.cell(1, 15, "nbBlocks")

path = os.getcwd()
files = [file for file in glob.glob(os.path.join(path, "**/*.jpg"), recursive=True)]

for nbBlocks in range(1, 500, 10000):
    for i in range(len(files)):
        file = files[i]
        properties = file.split("\\")[-1].split(".")[0].split("_")
        environment, light, brightness, orgColor = properties[0], properties[1], properties[2], properties[3]
        img = cut_image(file)

        #no blur
        b, g, r = cv2.split(img)
        noBlurScr = score.scoreImg(r, g, b, orgColor, nbBlocks)

        #Gaussian blur
        start = time.time_ns()
        output = cv2.GaussianBlur(img, (5, 5), 0)
        stop = time.time_ns()

        b, g, r = cv2.split(output)
        gbScr = score.scoreImg(r, g, b, orgColor, nbBlocks)
        gbTime = stop - start

        #Median blur
        start = time.time_ns()
        output = cv2.medianBlur(img, (5, 5))
        stop = time.time_ns()

        b, g, r = cv2.split(output)
        medianScr = score.scoreImg(r, g, b, orgColor, nbBlocks)
        medianTime = stop - start

        #Mean blur
        start = time.time_ns()
        output = cv2.blur(img, (5, 5))
        stop = time.time_ns()

        b, g, r = cv2.split(output)
        meanScr = score.scoreImg(r, g, b, orgColor, nbBlocks)
        meanTime = stop - start

        #fast denoising shit
        start = time.time_ns()
        cv2.fastNlMeansDenoisingColored(img, output)
        stop = time.time_ns()

        b, g, r = cv2.split(output)
        fastScr = score.scoreImg(r, g, b, orgColor, nbBlocks)
        fastTime = stop - start

        addToExcell(sheet, i, orgColor, environment, light, brightness,
                    noBlurScr, gbScr, gbTime, medianScr, medianTime, meanScr, meanTime,
                    fastScr, fastTime, nbBlocks)

    file = os.path.join(os.getcwd(), "test.xls")
    wb.save(file)

