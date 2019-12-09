import ColorRange from './ColorRange'

export default class BarcodeScanner {
  static scan(imageObject) {
    //TODO: preprocess??
    this.debugPixels(imageObject)
    let hor = this.scanHorizontal(imageObject)
    let ver = this.scanVertical(imageObject)
    let maxRatio = Math.max(hor[2], ver[2])
    if (hor[2] === maxRatio && maxRatio >= 0) {
      return hor[0]
    } else if (maxRatio >= 0) return ver[0]
  }

  static scanHorizontal(imageObject) {
    let height = imageObject.height
    let image = imageObject.data
    let scanned = 0
    let barcodes = {}
    let average = image[1]
    let start = true
    let white = true
    let count = 1
    for (let i = 4; i < image.length; i += 4) {
      let S = image[i + 1]
      let L = image[i + 2]
      let contrast = average - L
      if (S < 60) {
        if (contrast > 70) {
          //from white to black
          count = 1
          average = L
          scanned++
        } else if (contrast < -70) {
          //from black to white
          count = 1
          average = L
          scanned++
        } else if (Math.abs(contrast) > 33) {
          //from grey to black or white
          if (start) {
            white = L > 50
            count = 1
            average = L
            start = false
          } else if (scanned >= 0) {
            scanned *= 2
            if (white) {
              scanned += 2
            } else {
              scanned++
            }
            if (barcodes[scanned] === undefined) {
              barcodes[scanned] = 1
            } else {
              barcodes[scanned] += 1
            }
            scanned = 0
            start = true
          }
        } else {
          average = (average * count + L) / ++count
        }
      }
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

  static testBar(list) {
    let scanned = 0
    let barcodes = {}
    let average = list[1]
    let count = 1
    let start = true
    let white = true
    let contrast
    for (let i = 1; i < list.length; i += 1) {
      let L = list[i]
      contrast = average - L
      if (contrast > 70) {
        //from white to black
        count = 1
        average = L
        scanned++
      } else if (contrast < -70) {
        //from black to white
        count = 1
        average = L
        scanned++
      } else if (Math.abs(contrast) > 33) {
        if (start) {
          white = L > 50
          count = 1
          average = L
          start = false
        } else if (scanned >= 0) {
          scanned *= 2
          if (white) {
            scanned += 2
          } else{
            scanned ++
          }
          if (barcodes[scanned] === undefined) {
            barcodes[scanned] = 1
          } else {
            barcodes[scanned] += 1
          }
          scanned = 0
          start = true
        }
      } else {
        average = (average * count + L) / ++count
      }
    }
    console.log(barcodes)
    console.log('scanned')
    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    let ratio = maxAmount / 10
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

  static preProcessBarcode(imageObject) {
    let [min, max] = this.getMaxMinValues

    this.applyLevelsAdjustment(imageObject, min, max)
  }

  static getMaxMinValues(imageObject) {
    let max = 0
    let min = Infinity

    let pixels = imageObject.data
    let start = Math.floor(pixels.length / 3)
    let end = Math.ceil((pixels.length * 2) / 3)
    for (let i = start; i < end * 3; i += 4) {
      let value = pixels[i + 2]

      if (value < min) {
        min = value
      }
      if (value > max) {
        max = value
      }
    }

    return [min, max]
  }

  /**
   * TODO: waar max en min uitlezen, in welke matrix read + over alle pixels?
   *
   * @param {Array} arr pixel array TODO: uitbreiden naar matrix?
   * @param {int} min min grijswaarde : [0..100]
   * @param {int} max max grijswaarde : [0..100]
   */
  static applyLevelsAdjustment(imageObject, min, max) {
    let fac = (max - min) / 100

    let arr = imageObject.data
    for (let i = 0; i < arr.length; i++) {
      arr[i + 2] = (arr[i + 2] - min) * fac
    }

    return arr
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
