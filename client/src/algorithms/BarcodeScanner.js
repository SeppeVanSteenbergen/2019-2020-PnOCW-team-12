import ColorRange from './ColorRange'

export default class BarcodeScanner {
  static scan(imageObject) {
    let pixels = imageObject //anders worden pixel values aangepast in pre-process

    //this.preProcessBarcode(pixels)

    //this.debugPixels(pixels)

    let hor = this.scanHorizontal(pixels)
    //let ver = this.scanVertical(pixels)
    //let maxRatio = Math.max(hor[2], ver[2])
    // if (hor[2] === maxRatio && maxRatio >= 0) {
    //  return hor[0]
    //} else if (maxRatio >= 0) return ver[0]
  }

  static scanHorizontal(imageObject) {
    let height = imageObject.height
    let image = imageObject.data

    let barcodes = {}
    let scanned = 0
    let previous = image[2]
    let white
    let scanning = false
    for (let i = 4; i < image.length; i += 4) {
      let H = image[i]
      let S = image[i + 1]
      let L = image[i + 2]
      let contrast = previous - L
      if (S < 60 && (L < 20 || 75 < L)) {
        //grijswaarden (kan veranderd worden in 'geen bordercolor')
        if (!scanning) {
          scanning = true
          white = L > 50
        } else if (contrast > 70 || contrast < -70) {
          // zwart <-> wit
          scanned++
        }
      } else if (scanning && (scanned !== 0 || white === true)) {
        //scanned !== 0 || white === true to skip the "black" barcode
        //geen grijswaarde
        scanning = false
        scanned *= 2
        if (!white) {
          scanned--
        }
        //scanned toevoegen aan barcodes
        if (!ColorRange.inMaskRange(H, S, L)) {
          if (barcodes[[scanned, white]] === undefined) {
            barcodes[[scanned, white]] = 1
          } else {
            barcodes[[scanned, white]] += 1
          }
        }
        scanned = 0
      }
      previous = L
    }
    console.log(barcodes)
    console.log('scanned')
    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    let ratio = maxAmount / height / 10
    if (detectRatio < 0) {
      console.log('Picture is not good enough to detect barcode horizontal')
      return [0, 0, 0]
    } else {
      // console.log(detectRatio, ratio);
      let barcode = parseInt(
        Object.keys(barcodes)
          .find(key => barcodes[key] === maxAmount)
          .toString()
          .replace(/,/g, '')
      )
      console.log(barcode)
      console.log(detectRatio)
      return [barcode, ratio, detectRatio]
    }
  }

  static average(list) {
    let tmpList = list.slice()
    tmpList.sort()
    return tmpList[Math.round(tmpList.length / 2)]
  }

  static debugPixels(imageObject) {
    let image = imageObject.data
    let result = []
    for (let i = 0; i < image.length; i += 4) {
      let S = image[i + 1]
      let L = image[i + 2]
      result.push([S, L])
    }
    console.log(result)
  }

  static pixelToPosition(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4
  }

  /**
   * Pre-process the image for better barcode decoding
   *
   * @param {ImageData} imageObject
   */
  static preProcessBarcode(imageObject) {
    let [minl, maxl] = this.getMaxMinValues(imageObject, 2)
    let [mins, maxs] = this.getMaxMinValues(imageObject, 1)
    let s = mins + (mins + maxs) * 0.7
    this.applyLevelsAdjustment(imageObject, minl, maxl, s)
  }

  /**
   * Get max and min L values from the given image
   *
   * Optional: use start and end constants to limit search domain
   *
   * @param {ImageData} imageObject
   */
  static getMaxMinValues(imageObject, value) {
    let max = 0
    let min = 0

    let pixels = imageObject.data
    let grayList = []
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 1] < 50) {
        grayList.push(pixels[i + value])
      }
    }
    grayList.sort()
    let end = (grayList.length * 20) / 100
    for (let i = 0; i < end; i++) {
      min += grayList[i]
    }
    min /= end

    for (let i = Math.round(grayList.length - end); i < grayList.length; i++) {
      max += grayList[i]
    }
    max /= end

    return [min, max]
  }

  /**
   * Apply Histogram equilization with extra CONTRAST constant
   *
   * @param {Array} arr pixel array TODO: uitbreiden naar matrix?
   * @param {int} min min grijswaarde : [0..100]
   * @param {int} max max grijswaarde : [0..100]
   */
  static applyLevelsAdjustment(imageObject, min, max, s) {
    const half = (max + min) / 2
    console.log(half, max, min)
    let pixels = imageObject.data
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 1] < s) {
        if (pixels[i + 2] < half) {
          pixels[i + 2] = 0
        } else {
          pixels[i + 2] = 100
        }
      }
    }
    return imageObject
  }

  static scanVertical(imageObject) {
    let height = imageObject.height
    let image = imageObject.data

    let scanned = []
    let barcodes = {}

    for (let x = 0; x < imageObject.width; x++) {
      for (let y = 0; y < imageObject.height; y++) {
        // Color + code: Red = 1; Yellow = 2; Green = 3; Blue = 4; Pink = 5
        let i = this.pixelToPosition([x, y], imageObject.width)
        let H = image[i] * 2
        let S = image[i + 1]
        let L = image[i + 2]

        if (ColorRange.inWhiteRange(H, S, L)) {
          if (scanned.length === 5) {
            if (barcodes[scanned] === undefined) {
              barcodes[scanned] = 1
            } else {
              barcodes[scanned] += 1
            }
          }
          scanned = []
        } else if (ColorRange.inRedRange(H, S, L) && !scanned.includes(1)) {
          scanned.push(1)
        } else if (ColorRange.inYellowRange(H, S, L) && !scanned.includes(2)) {
          scanned.push(2)
        } else if (ColorRange.inGreenRange(H, S, L) && !scanned.includes(3)) {
          scanned.push(3)
        } else if (ColorRange.inBlueRange(H, S, L) && !scanned.includes(4)) {
          scanned.push(4)
        } else if (ColorRange.inPinkRange(H, S, L) && !scanned.includes(5)) {
          scanned.push(5)
        }
      }
    }

    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    //TODO: Needs to be updated with the right amount of barcodes on screen.
    let ratio = maxAmount / height / 10
    if (detectRatio < 0.5) {
      // console.log('Picture is not good enough to detect barcode vertical');
      return [0, 0, 0]
    } else {
      // console.log(detectRatio, ratio);
      let barcode = parseInt(
        Object.keys(barcodes)
          .find(key => barcodes[key] === maxAmount)
          .toString()
          .replace(/,/g, '')
      )
      return [barcode, ratio, detectRatio]
    }
  }
  static positionToPixel(position, width) {
    position /= 4
    let x = position % width
    let y = (position - x) / width
    return [x, y]
  }
}
