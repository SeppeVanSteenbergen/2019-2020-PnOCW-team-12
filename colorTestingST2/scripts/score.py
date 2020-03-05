import colorsys
import math
import random
import numpy as np


def rgb_to_hsl(red, green, blue):
    h, l, s = colorsys.rgb_to_hls(red / 255, green / 255, blue / 255)

    h *= 360
    s *= 100
    l *= 100

    return h, s, l


def scoreImg(Rmatrix, Gmatrix, Bmatrix, origColor, nbBlocks, randomPixels):
    nbBlockSplit = int(math.sqrt(nbBlocks))
    blocksR = split(Rmatrix, nbBlockSplit)
    blocksG = split(Gmatrix, nbBlockSplit)
    blocksB = split(Bmatrix, nbBlockSplit)
    totalScore = 0
    if origColor != "Black" and origColor != "White":
        origValue = colors.get(origColor)
        for i in range(nbBlockSplit):
            totalScore += scoreBlockColor(blocksR[i], blocksG[i], blocksB[i], origValue, randomPixels)
    else:
        black = "Black" == origColor
        for i in range(nbBlockSplit):
            totalScore += scoreBlockNonColor(blocksR[i], blocksG[i], blocksB[i], black, randomPixels)
    return totalScore / nbBlockSplit


def scoreBlockColor(Rmatrix, Gmatrix, Bmatrix, origValue, randomPixels):
    height, width = Rmatrix.shape
    blockScore = 0
    area = height * width
    # 5% random pixels out of block as samples
    for pixel in randomPixels:
        x = pixel[0]
        y = pixel[1]
        pixelR = Rmatrix[y][x]
        pixelG = Gmatrix[y][x]
        pixelB = Bmatrix[y][x]
        pixelH, pixelS, pixelL = rgb_to_hsl(pixelR, pixelG, pixelB)
        blockScore += calcScoreColor([pixelH, pixelS, pixelL], origValue)
    return blockScore / len(randomPixels)


def scoreBlockNonColor(Rmatrix, Gmatrix, Bmatrix, origValue, randomPixels):
    height, width = Rmatrix.shape
    blockScore = 0
    area = height * width
    for pixel in randomPixels:
        x = pixel[0]
        y = pixel[1]
        pixelR = Rmatrix[y][x]
        pixelG = Gmatrix[y][x]
        pixelB = Bmatrix[y][x]
        blockScore += calcScoreNonColor([pixelR, pixelG, pixelB], origValue)
    return blockScore / len(randomPixels)


def calcScoreColor(pixel, origValue):
    h = pixel[0]
    l = pixel[2]
    if 10 < l < 90:
        return 1 - (min(abs(h - origValue), 360 - abs(h - origValue))) / 180
    else:
        return 0


def calcScoreNonColor(pixel, black):
    maxDistance = 441.6729559300637
    if black:
        dist = np.sqrt(pixel[0]**2 + pixel[1]**2 + pixel[2]**2)
        return 1 - dist / maxDistance
    else:
        dist = np.sqrt((pixel[0]-255)**2 + (pixel[1]-255)**2 + (pixel[2]-255)**2)
        return 1 - dist / maxDistance


def split(array, nbSplit):
    orHeight, orWidth = array.shape
    newHeight = orHeight - orHeight % nbSplit
    newWidth = orWidth - orWidth % nbSplit
    subArray = array[:newHeight, :newWidth]
    hSplitArray = np.hsplit(subArray, nbSplit)
    splitArray = []
    for subA in hSplitArray:
        splitArray += np.vsplit(subA, nbSplit)
    return splitArray



colors = {
    "Red": 360,
    "Blue": 240,
    "Green": 120,
    "BlueGreen": 180,
    "Purple": 300,
    "Yellow": 60
}
