export default class BarcodeScanner {
  static scan(image, width, height, sensitivity) {
    //Always searching on the middle line
    let searchHeight = Math.round(height / 2)
    let scanned = []

    for (
      let i = (searchHeight - 1) * width * 4;
      i < searchHeight * width * 4;
      i += 4
    ) {
      // Hue color values + code: 24/1; 72/2; 180/3; 288/4; 336/5
      let H = image[i] * 2
      let S = image[i + 1]
      let L = image[i + 2]

      if (L > 70 && S < 50) {
        if (scanned.length === 5) {
          return scanned
        }
        scanned = []
      } else if (
        H > 24 - sensitivity &&
        H < 24 + sensitivity &&
        S > 50 &&
        !scanned.includes(1)
      ) {
        scanned.push(1)
      } else if (
        H > 72 - sensitivity &&
        H < 72 + sensitivity &&
        S > 50 &&
        !scanned.includes(2)
      ) {
        scanned.push(2)
      } else if (
        H > 180 - sensitivity &&
        H < 180 + sensitivity &&
        S > 50 &&
        !scanned.includes(3)
      ) {
        scanned.push(3)
      } else if (
        H > 288 - sensitivity &&
        H < 288 + sensitivity &&
        S > 50 &&
        !scanned.includes(4)
      ) {
        scanned.push(4)
      } else if (
        H > 336 - sensitivity &&
        H < 336 + sensitivity &&
        S > 50 &&
        !scanned.includes(5)
      ) {
        scanned.push(5)
      }
    }
  }

  static rgbaToHsla(image) {
    for (let i = 0; i < image.length; i += 4) {
      //convert rgb spectrum to 0-1
      let red = image[i] / 255
      let green = image[i + 1] / 255
      let blue = image[i + 2] / 255

      let min = Math.min(red, green, blue)
      let max = Math.max(red, green, blue)

      let L = (min + max) / 2
      let S = this.findSaturation(min, max, L)
      let H = this.findHue(red, green, blue, max, min)

      image[i] = H / 2
      image[i + 1] = Math.round(S * 100)
      image[i + 2] = Math.round(L * 100)
    }

    return image
  }

  static findSaturation(min, max, L) {
    if (L < 0.5) {
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
}
