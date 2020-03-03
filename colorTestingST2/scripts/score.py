import random
import numpy as np
from colorTestingST2.scripts.ImageFiltering import rgb_to_hsl


def scoreImg(Rmatrix, Gmatrix, Bmatrix, origColor, nbBlocks):
    origHeight, origWidth = Rmatrix.shape
    blocksR = split(Rmatrix, origHeight // nbBlocks, origWidth // nbBlocks)
    blocksG = split(Gmatrix, origHeight // nbBlocks, origWidth // nbBlocks)
    blocksB = split(Bmatrix, origHeight // nbBlocks, origWidth // nbBlocks)
    totalScore = 0
    if origColor != "Black" and origColor != "White":
        origValue = colors.get(origColor)
        for i in range(nbBlocks):
            totalScore += scoreBlockColor(blocksR[i], blocksG[i], blocksB[i], origValue)
    else:
        black = "Black" == origColor
        for i in range(nbBlocks):
            totalScore += scoreBlockNonColor(blocksR[i], blocksG[i], blocksB[i], black)
    return totalScore / nbBlocks


def scoreBlockColor(Rmatrix, Gmatrix, Bmatrix, origValue):
    height, width = Rmatrix.shape
    blockScore = 0
    area = height * width
    # 5% random pixels out of block as samples
    for i in range(area * 0.05):
        x = random.randint(width)
        y = random.randint(height)
        pixelR = Rmatrix[y][x]
        pixelG = Gmatrix[y][x]
        pixelB = Bmatrix[y][x]
        pixelH, pixelS, pixelL = rgb_to_hsl(pixelR, pixelG, pixelB)
        blockScore += ([pixelH,pixelS,pixelL], origValue)
    return blockScore / (area * 0.05)


def scoreBlockNonColor(Rmatrix, Gmatrix, Bmatrix, black):
    height, width = Rmatrix.shape
    blockScore = 0
    area = height * width
    for i in range(area * 0.05):
        x = random.randint(width)
        y = random.randint(height)
        pixelR = Rmatrix[y][x]
        pixelG = Gmatrix[y][x]
        pixelB = Bmatrix[y][x]
        blockScore += calcScoreNonColor([pixelR, pixelG, pixelB], black)
    return blockScore / (area * 0.05)


def calcScoreColor(pixel, origValue):
    h = pixel[0]
    l = pixel[2]
    if 10 < l < 90:
        return 1 - ((h - origValue) % 360)/180
    else:
        return 0


def calcScoreNonColor(pixel, black):
    if black:
        dist = np.sqrt(pixel[0]**2 + pixel[1]**2 + pixel[2]**2)
        return 1 - dist / 255
    else:
        dist = np.sqrt((pixel[0]-255)**2 + (pixel[1]-255)**2 + (pixel[2]-255)**2)
        return 1 - dist / 255


# Author: Dat Nguyen
def split(array, nRows, nCols):
    r, h = array.shape
    return (array.reshape(h//nRows, nRows, -1, nCols)
                 .swapaxes(1, 2)
                 .reshape(-1, nRows, nCols))


colors = {
    "Red": 360,
    "Blue": 240,
    "Green": 120,
    "BlueGreen": 180,
    "Purple": 300,
    "Yellow": 60
}
