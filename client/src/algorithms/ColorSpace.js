export default class ColorSpace {
  /**
   * pixels as array in rgba colorspace
   * math from https://www.rapidtables.com/convert/color/rgb-to-hsl.html
   */
  static rgbaToHsla(pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
      // Convert rgb spectrum to 0-1
      let red = pixels[i] / 255
      let green = pixels[i + 1] / 255
      let blue = pixels[i + 2] / 255

      let min = Math.min(red, green, blue)
      let max = Math.max(red, green, blue)

      let L = (min + max) / 2
      let S = this.findSaturation(min, max, L)
      let H = this.findHue(red, green, blue, max, min)

      pixels[i] = H / 2
      pixels[i + 1] = Math.round(S * 100)
      pixels[i + 2] = Math.round(L * 100)
    }
  }

  static findSaturation(min, max, L) {
    if (L < 0.5) {
      if (min + max === 0) {
        return 0
      }
      return (max - min) / (max + min)
    } else {
      return (max - min) / (2.0 - max - min)
    }
  }

  static findHue(red, green, blue, max, min) {
    let hue = 0
    if (max === min) {
      return 0
    } else if (red === max) {
      hue = (green - blue) / (max - min)
    } else if (green === max) {
      hue = 2.0 + (blue - red) / (max - min)
    } else if (blue === max) {
      hue = 4.0 + (red - green) / (max - min)
    }

    hue *= 60
    if (hue < 0) {
      hue += 360
    }
    return hue
  }

  /**
   * pixels as array in hsla colorspace
   * math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
   */
  static hslaToRgba(pixels) {
    let R
    let G
    let B
    let tmp1
    let tmp2
    let tmpR
    let tmpG
    let tmpB
    for (let i = 0; i < pixels.length; i += 4) {
      let H = (pixels[i] * 2) / 360.0
      let S = pixels[i + 1] / 100.0
      let L = pixels[i + 2] / 100.0

      if (S === 0) {
        R = L
        G = L
        B = L
      } else {
        if (L < 0.5) {
          tmp1 = L * (1.0 + S)
        } else {
          tmp1 = L + S - L * S
        }
        tmp2 = 2 * L - tmp1

        tmpR = H + 1 / 3
        tmpR = this.setTemporaryInRange(tmpR)

        tmpG = H
        tmpG = this.setTemporaryInRange(tmpG)

        tmpB = H - 1 / 3
        tmpB = this.setTemporaryInRange(tmpB)

        R = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpR)
        G = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpG)
        B = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpB)
      }

      pixels[i] = Math.round(R * 255)
      pixels[i + 1] = Math.round(G * 255)
      pixels[i + 2] = Math.round(B * 255)
    }
  }

  static setTemporaryInRange(temp) {
    if (temp > 1) {
      return temp - 1
    } else if (temp < 0) {
      return temp + 1
    }
    return temp
  }

  static hslaToRgbaCalculateColor(tmp1, tmp2, tmpColor) {
    if (6 * tmpColor < 1) {
      return tmp2 + (tmp1 - tmp2) * 6 * tmpColor
    } else if (2 * tmpColor < 1) {
      return tmp1
    } else if (3 * tmpColor < 2) {
      return tmp2 + (tmp1 - tmp2) * (0.666 - tmpColor) * 6
    }
    return tmp2
  }

  static calcLuminance(pixels) {
    let lum = 0
    let size = pixels.length / 4
    for (let i = 2; i < pixels.length; i += 4) {
      lum += pixels[i]
    }
    return lum / size
  }

  /**
   * pixels as array in rgba colorspace
   * math from https://www.easyrgb.com/en/math.php
   */
  static rgbaToXyza(pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
      // Convert rgb spectrum to 0-1
      let red = pixels[i] / 255
      let green = pixels[i + 1] / 255
      let blue = pixels[i + 2] / 255

      red = red > 0.04045 ? Math.pow((red + 0.055) / 1.055, 2, 4) : red / 12.92
      green =
        green > 0.04045
          ? Math.pow((green + 0.055) / 1.055, 2, 4)
          : green / 12.92
      blue =
        blue > 0.04045 ? Math.pow((blue + 0.055) / 1.055, 2, 4) : blue / 12.92

      red *= 100
      green *= 100
      blue *= 100

      let X = red * 0.4124 + green * 0.3576 + blue * 0.1805
      let Y = red * 0.2126 + green * 0.7152 + blue * 0.0722
      let Z = red * 0.0193 + green * 0.1192 + blue * 0.9505

      pixels[i] = X
      pixels[i + 1] = Y
      pixels[i + 2] = Z
    }

    return pixels
  }

  /**
   * pixels as array in xyza colorspace
   * math from https://www.easyrgb.com/en/math.php
   */
  static xyzaToCieLab(pixels) {
    for (let i = 0; i < pixels.length; i += 4) {
      let X = pixels[i] / 95.047
      let Y = pixels[i + 1] / 100
      let Z = pixels[i + 2] / 108.883

      X = X > 0.008856 ? Math.pow(X, 1 / 3) : 7.787 * X + 16 / 116
      Y = Y > 0.008856 ? Math.pow(Y, 1 / 3) : 7.787 * Y + 16 / 116
      Z = Z > 0.008856 ? Math.pow(Z, 1 / 3) : 7.787 * Z + 16 / 116

      let CieL = 116 * Y - 16
      let CieA = 500 * (X - Y)
      let CieB = 200 * (Y - Z)

      pixels[i] = CieL
      pixels[i + 1] = CieA
      pixels[i + 2] = CieB
    }

    return pixels
  }
}
