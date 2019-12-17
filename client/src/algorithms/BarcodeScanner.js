import ColorRange from './ColorRange'
import PixelIterator from './PixelIterator'

export default class BarcodeScanner {
  static scan(imageObject, LU, RU, clientInfo) {
    let clients = clientInfo.length
    this.preProcessBarcode(imageObject)
    let iterator = new PixelIterator(
      LU,
      RU,
      imageObject.width,
      imageObject.height
    )
    console.log(imageObject)
    let barcode = this.scanHorizontal(imageObject, iterator, clients)
    return barcode
  }

  static scanHorizontal(imageObject, iterator) {
    let image = imageObject.data
    let barcodes = {}
    let scanned = 0
    let previous = image[2]
    let white
    let scanning = false
    let sep = false
    let current = iterator.next()
    while (current !== null) {
      let i = this.pixelToIndex(current, imageObject.width)
      let H = image[i] * 2
      let S = image[i + 1]
      let L = image[i + 2]
      let contrast = previous - L
      if ((L === 0 || 100 === L) && sep) {
        //grijswaarden (kan veranderd worden in 'geen bordercolor')
        if (!scanning) {
          scanning = true
          white = L > 50
        } else if (contrast > 70 || contrast < -70) {
          // zwart <-> wit
          scanned++
        }
      } else if (ColorRange.inBlueGreenRange(H, S, L)) {
        sep = true
        if (scanning && scanned !== 0 && scanned !== 1) {
          scanning = false
          if (barcodes[[scanned, white]] === undefined) {
            barcodes[[scanned, white]] = 1
          } else {
            barcodes[[scanned, white]] += 1
          }
          scanned = 0
        }
      } else {
        sep = false
        scanning = false
        scanned = 0
      }
      previous = L
      current = iterator.next()
    }

    console.log(barcodes)
    console.log('scanned')
    let keys = this.calcKeys(barcodes)
    let filteredCode = this.filterBarcode(keys)
    console.log(filteredCode)
    let barcode = filteredCode[0]
    let highestWhite = filteredCode[1]
    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)
    let detectRatio = maxAmount / detectedAmount
    barcode *= 2
    if (highestWhite) {
      barcode -= 2
    } else barcode--
    console.log(detectRatio)
    console.log(barcode)
    return barcode
  }

  static calcKeys(dict, clients) {
    let keys = Object.keys(dict)
    let resultKeys = []
    for (let i = 0; i < keys.length; i++) {
      if ([keys[i]] <= (clients / 2) + 2) { //aantal clients wordt + 2 gedaan bij creatie barcode om meer baren te hebben
        resultKeys.push([
          parseInt(keys[i][0]),
          keys[i].substring(2) === 'true',
          dict[keys[i]]
        ])
      }
    }
    return resultKeys
  }

  static filterBarcode(list) {
    let length = list.length
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length - i - 1; j++) {
        if (list[j][2] < list[j + 1][2]) {
          let tmp = list[j + 1]
          list[j + 1] = list[j]
          list[j] = tmp
        }
      }
    }
    console.log(list)
    return list[0]
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

  /**
   * Pre-process the image for better barcode decoding
   *
   * @param {ImageData} imageObject
   */
  static preProcessBarcode(imageObject) {
    let [minl, maxl] = this.getMaxMinValues(imageObject, 2)
    this.applyLevelsAdjustment(imageObject, minl, maxl)
  }

  /**
   * Get max and min L values from the given image
   *
   * Optional: use start and end constants to limit search domain
   *
   * @param {ImageData} imageObject
   * @param value
   */
  static getMaxMinValues(imageObject, value) {
    let pixels = imageObject.data
    let grayList = []
    for (let i = 0; i < pixels.length; i += 4) {
      let H = pixels[i] * 2
      let S = pixels[i + 1]
      let L = pixels[i + 2]
      if (
        !ColorRange.inMaskRange(H, S, L) &&
        !ColorRange.inBlueGreenRange(H, S, L)
      ) {
        grayList.push(pixels[i + value])
      }
    }
    grayList.sort(function(a, b) {
      return a - b
    })

    return [grayList[0], grayList[grayList.length - 1]]
  }

  /**
   * Apply Histogram equilization with extra CONTRAST constant
   *
   * @param {Array} arr pixel array TODO: uitbreiden naar matrix?
   * @param {int} min min grijswaarde : [0..100]
   * @param {int} max max grijswaarde : [0..100]
   */
  static applyLevelsAdjustment(imageObject, min, max) {
    const half = (max + min) / 2
    console.log(half, max, min)
    let pixels = imageObject.data
    for (let i = 0; i < pixels.length; i += 4) {
      let H = pixels[i] * 2
      let S = pixels[i + 1]
      let L = pixels[i + 2]
      if (
        !ColorRange.inMaskRange(H, S, L) &&
        !ColorRange.inBlueGreenRange(H, S, L)
      ) {
        if (pixels[i + 2] < half) {
          pixels[i + 2] = 0
        } else {
          pixels[i + 2] = 100
        }
      }
    }
    return imageObject
  }

  static pixelToIndex(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4
  }

  static indexToPixel(position, width) {
    position /= 4
    let x = position % width
    let y = (position - x) / width
    return [x, y]
  }
}
