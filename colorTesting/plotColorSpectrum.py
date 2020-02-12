import colorsys
import cv2
import glob
import os
import sys
from mpl_toolkits import mplot3d

import numpy as np
import math
import matplotlib.pyplot as plt
from matplotlib.ticker import AutoMinorLocator


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


def prep_images(color):
    path = os.path.join(os.getcwd(), "images/input", color)

    images = [cv2.imread(file) for file in glob.glob(os.path.join(path, "**/*.jpg"), recursive=True)]

    if not images:
        sys.exit(print("No images in this folder"))

    images = np.concatenate(images)
    b, g, r = cv2.split(images)

    return np.concatenate(r), np.concatenate(g), np.concatenate(b)


def display_rgb(color, r, g, b, size, plot_color):
    # Start plotting environment
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="3d")

    # Set title
    ax.set_title("Red, Green and Blue values", fontsize=20, fontweight="bold", pad=15)

    # Set each axis color
    ax.xaxis.line.set_color("red")
    ax.yaxis.line.set_color("green")
    ax.zaxis.line.set_color("blue")

    # Label each axis
    ax.set_xlabel("Red", fontsize=15, labelpad=20)
    ax.set_ylabel("Green", fontsize=15, labelpad=20)
    ax.zaxis.set_rotate_label(False)
    ax.set_zlabel("Blue", fontsize=15, labelpad=10, rotation=90)

    # Set each label color
    ax.xaxis.label.set_color("red")
    ax.yaxis.label.set_color("green")
    ax.zaxis.label.set_color("blue")

    # Set each axis limits
    ax.set_xlim(0, 255)
    ax.set_ylim(0, 255)
    ax.set_zlim(0, 255)

    # Set each axis ticks
    ax.set_xticks(np.arange(255, step=50))
    ax.xaxis.set_tick_params(labelsize=15)
    ax.set_yticks(np.arange(255, step=50))
    ax.yaxis.set_tick_params(labelsize=15)
    ax.set_zticks(np.arange(255, step=50))
    ax.zaxis.set_tick_params(labelsize=15)

    # Set each tick color
    ax.tick_params(axis="x", colors="red")
    ax.xaxis._axinfo["tick"]["color"] = "red"
    ax.tick_params(axis="y", colors="green")
    ax.yaxis._axinfo["tick"]["color"] = "green"
    ax.tick_params(axis="z", colors="blue")
    ax.zaxis._axinfo["tick"]["color"] = "blue"

    # Set each axis grid color
    ax.xaxis._axinfo["grid"]["color"] = "red"
    ax.xaxis._axinfo["grid"]["linestyle"] = "dashed"
    ax.yaxis._axinfo["grid"]["color"] = "green"
    ax.yaxis._axinfo["grid"]["linestyle"] = "dashed"
    ax.zaxis._axinfo["grid"]["color"] = "blue"
    ax.zaxis._axinfo["grid"]["linestyle"] = "dashed"

    # Get rid of colored axes planes
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False
    ax.xaxis.pane.set_edgecolor("white")
    ax.yaxis.pane.set_edgecolor("white")
    ax.zaxis.pane.set_edgecolor("white")

    # Plot all the pixels
    ax.scatter3D(r, g, b, s=size, c=plot_color)

    # Save plot
    plt.tight_layout()
    ax.view_init(azim=-135, elev=15)

    path = os.path.join(os.getcwd(), "images/output", color)
    plt.savefig(os.path.join(path, "rgb.png"), dpi=300, transparent=False, bbox_inches="tight", pad_inches=1)

    # Close plot
    plt.close(fig)


def display_hue_histogram(color, h, plot_color):
    # Start plotting environment
    fig = plt.figure()
    ax = plt.axes()

    # Set title
    ax.set_title("Hue histogram", fontsize=20, fontweight="bold", pad=15)

    # Set each axis color
    ax.spines["bottom"].set_color("red")
    ax.spines["top"].set_color("red")
    ax.spines["left"].set_color("black")
    ax.spines["right"].set_color("black")

    # Label each axis
    ax.set_xlabel("Hue", fontsize=15, labelpad=5)
    ax.set_ylabel("Amount of pixels", fontsize=15, labelpad=5)

    # Set each label color
    ax.xaxis.label.set_color("red")
    ax.yaxis.label.set_color("black")

    # Set each axis ticks
    x_min, x_max = get_xaxis_limits(h)
    if x_max - x_min <= 180:
        plt.xticks(np.arange(x_min, x_max + 1, step=20), fontsize=15)
        ax.xaxis.set_minor_locator(AutoMinorLocator(4))
    else:
        plt.xticks(np.arange(x_min, x_max + 1, step=60), fontsize=15)
        ax.xaxis.set_minor_locator(AutoMinorLocator(6))
    plt.yticks(fontsize=15)

    # Set each tick color
    ax.tick_params(axis="x", length=5, pad=10, colors="red")
    ax.tick_params(axis="y", length=5, pad=10, colors="black")
    ax.tick_params(which="minor", length=3, color="red")

    # Set each axis grid color
    plt.grid(axis="x", color="red", linestyle="--")
    plt.grid(axis="y", color="black", linestyle="--")

    # Plot Hue histogram
    h = [int(round(hue)) for hue in h]
    plt.hist(h, max(h) - min(h) + 1, facecolor=plot_color)

    # Set each axis limits
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(0, ax.get_yticks()[-2])

    # Add min and max line to plot
    plt.axvline(min(h), linewidth=1, color="blue", linestyle="-.", label="min: {}".format(min(h)))
    plt.axvline(max(h), linewidth=1, color="red", linestyle="-.", label="max: {}".format(max(h)))

    # Show plot
    chartBox = ax.get_position()
    ax.set_position([chartBox.x0, chartBox.y0, chartBox.width * 0.6, chartBox.height])
    ax.legend(loc='upper left', bbox_to_anchor=(1, 1), ncol=1)
    plt.tight_layout()

    path = os.path.join(os.getcwd(), "images/output", color)
    plt.savefig(os.path.join(path, "hueHist.png"), dpi=300, transparent=False, bbox_inches="tight", pad_inches=1)

    # Close plot
    plt.close(fig)


def display_hsl(color, h, s, l, size, plot_color):
    # Start plotting environment
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="3d")

    # Set title
    ax.set_title("Hue, Saturation and Lightness values", fontsize=20, fontweight="bold", pad=15)

    # Set each axis color
    ax.w_xaxis.line.set_color("red")
    ax.w_yaxis.line.set_color("green")
    ax.w_zaxis.line.set_color("blue")

    # Label each axis
    ax.set_xlabel("Hue", fontsize=15, labelpad=20)
    ax.set_ylabel("Saturation", fontsize=15, labelpad=20)
    ax.zaxis.set_rotate_label(False)
    ax.set_zlabel("Lightness", fontsize=15, labelpad=10, rotation=90)

    # Set each label color
    ax.xaxis.label.set_color("red")
    ax.yaxis.label.set_color("green")
    ax.zaxis.label.set_color("blue")

    # Set each axis limits
    ax.set_xlim(0, 360)
    ax.set_ylim(0, 100)
    ax.set_zlim(0, 100)

    # Set each axis ticks
    ax.set_xticks(np.arange(361, step=60))
    ax.xaxis.set_tick_params(labelsize=15)
    ax.set_yticks(np.arange(101, step=20))
    ax.yaxis.set_tick_params(labelsize=15)
    ax.set_zticks(np.arange(101, step=20))
    ax.zaxis.set_tick_params(labelsize=15)

    # Set each tick color
    ax.tick_params(axis="x", colors="red")
    ax.xaxis._axinfo["tick"]["color"] = "red"
    ax.tick_params(axis="y", colors="green")
    ax.yaxis._axinfo["tick"]["color"] = "green"
    ax.tick_params(axis="z", colors="blue")
    ax.zaxis._axinfo["tick"]["color"] = "blue"

    # Set each axis grid color
    ax.xaxis._axinfo["grid"]["color"] = "red"
    ax.xaxis._axinfo["grid"]["linestyle"] = "dashed"
    ax.yaxis._axinfo["grid"]["color"] = "green"
    ax.yaxis._axinfo["grid"]["linestyle"] = "dashed"
    ax.zaxis._axinfo["grid"]["color"] = "blue"
    ax.zaxis._axinfo["grid"]["linestyle"] = "dashed"

    # Get rid of colored axes planes
    # First remove fill
    ax.xaxis.pane.fill = False
    ax.yaxis.pane.fill = False
    ax.zaxis.pane.fill = False

    # Now set color to white (or whatever is "invisible")
    ax.xaxis.pane.set_edgecolor('w')
    ax.yaxis.pane.set_edgecolor('w')
    ax.zaxis.pane.set_edgecolor('w')

    # Plot all the pixels
    ax.scatter3D(h, s, l, s=size, c=plot_color)

    # Save plot
    plt.tight_layout()
    ax.view_init(azim=-135, elev=15)

    path = os.path.join(os.getcwd(), "images/output", color)
    plt.savefig(os.path.join(path, "hsl3D.png"), dpi=300, transparent=False, bbox_inches="tight", pad_inches=1)

    # set up a figure twice as wide as it is tall
    fig = plt.figure(figsize=plt.figaspect(1 / 2))

    # ===============
    # First subplot
    # ===============
    # set up the axes for the first plot
    ax = fig.add_subplot(1, 2, 1)

    # Set title
    ax.set_title("Hue and Saturation values", fontsize=20, fontweight="bold", pad=15)

    # Set each axis color
    ax.spines["bottom"].set_color("red")
    ax.spines["top"].set_color("red")
    ax.spines["left"].set_color("green")
    ax.spines["right"].set_color("green")

    # Label each axis
    ax.set_xlabel("Hue", fontsize=15, labelpad=5)
    ax.set_ylabel("Saturation", fontsize=15, labelpad=5)

    # Set each label color
    ax.xaxis.label.set_color("red")
    ax.yaxis.label.set_color("green")

    # Set each axis limits
    x_min, x_max = get_xaxis_limits(h)
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(0, 100)

    # Set each axis ticks
    if x_max - x_min <= 180:
        plt.xticks(np.arange(x_min, x_max + 1, step=20), fontsize=15)
        ax.xaxis.set_minor_locator(AutoMinorLocator(4))
    else:
        plt.xticks(np.arange(x_min, x_max + 1, step=60), fontsize=15)
        ax.xaxis.set_minor_locator(AutoMinorLocator(6))

    plt.yticks(np.arange(101, step=20), fontsize=15)
    ax.yaxis.set_minor_locator(AutoMinorLocator(4))

    # Set each tick color
    ax.tick_params(axis="x", length=5, pad=10, colors="red")
    ax.tick_params(axis="y", length=5, pad=10, colors="green")
    ax.tick_params(axis="x", which="minor", length=3, color="red")
    ax.tick_params(axis="y", which="minor", length=3, color="green")

    # Set each axis grid color
    plt.grid(axis="x", color="red", linestyle="--")
    plt.grid(axis="y", color="green", linestyle="--")

    # Plot all the pixels
    plt.scatter(h, s, s=size, c=plot_color)

    # ===============
    # Second subplot
    # ===============
    # set up the axes for the second plot
    ax = fig.add_subplot(1, 2, 2)

    # Set title
    ax.set_title("Hue and Lightness values", fontsize=20, fontweight="bold", pad=15)

    # Set each axis color
    ax.spines["bottom"].set_color("red")
    ax.spines["top"].set_color("red")
    ax.spines["left"].set_color("blue")
    ax.spines["right"].set_color("blue")

    # Label each axis
    ax.set_xlabel("Hue", fontsize=15, labelpad=5)
    ax.set_ylabel("Lightness", fontsize=15, labelpad=5)

    # Set each label color
    ax.xaxis.label.set_color("red")
    ax.yaxis.label.set_color("blue")

    # Set each axis limits
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(0, 100)

    # Set each axis ticks
    x_min, x_max = get_xaxis_limits(h)
    if x_max - x_min <= 180:
        plt.xticks(np.arange(x_min, x_max + 1, step=20), fontsize=15)
        ax.xaxis.set_minor_locator(AutoMinorLocator(4))
    else:
        plt.xticks(np.arange(x_min, x_max + 1, step=60), fontsize=15)
        ax.xaxis.set_minor_locator(AutoMinorLocator(6))

    plt.yticks(np.arange(101, step=20), fontsize=15)
    ax.yaxis.set_minor_locator(AutoMinorLocator(4))

    # Set each tick color
    ax.tick_params(axis="x", length=5, pad=10, colors="red")
    ax.tick_params(axis="y", length=5, pad=10, colors="blue")
    ax.tick_params(axis="x", which="minor", length=3, color="red")
    ax.tick_params(axis="y", which="minor", length=3, color="blue")

    # Set each axis grid color
    plt.grid(axis="x", color="red", linestyle="--")
    plt.grid(axis="y", color="blue", linestyle="--")

    # Plot all the pixels
    plt.scatter(h, l, s=size, c=plot_color)

    # Save plot
    plt.tight_layout()

    path = os.path.join(os.getcwd(), "images/output", color)
    plt.savefig(os.path.join(path, "hsl.png"), dpi=300, transparent=False, bbox_inches="tight", pad_inches=1)

    # Close plot
    plt.close(fig)


def get_xaxis_limits(h):
    if max(h) - min(h) <= 180:
        x_min = round(min(h) / 20) * 20 - 20
        x_max = round(max(h) / 20) * 20 + 20
    else:
        x_min = round(min(h) / 60) * 60 - 60
        x_max = round(max(h) / 60) * 60 + 60

    if x_min < 10:
        x_min = 0
    if x_max > 350:
        x_max = 360

    return x_min, x_max


def plot_color_spectrum(colors):
    for color in colors:
        R, G, B = prep_images(color)
        display_rgb(color, R, G, B, 1, "black")

        H, S, L = rgb_to_hsl(R, G, B)
        display_hue_histogram(color, H, "black")
        display_hsl(color, H, S, L, 1, "black")


colors = ["blue", "blueGreen", "green", "pink", "red", "white", "yellow"]
plot_color_spectrum(colors)

# plt.show()
