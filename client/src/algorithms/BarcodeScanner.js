import ColorRange from './ColorRange'

export default class BarcodeScanner {
  static scan(imageObject) {
    let pixels = imageObject //anders worden pixel values aangepast in pre-process
    
    this.preProcessBarcode(pixels)

    this.debugPixels(pixels)

    let hor = this.scanHorizontal(pixels)
    let ver = this.scanVertical(pixels)
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
    let average = [image[1], image[1], image[1]]
    let newBar = true
    let start = true
    let white = true
    let count = 1
    for (let i = 4; i < image.length; i += 4) {
      let H = image[i]
      let S = image[i + 1]
      let L = image[i + 2]
      let contrast = this.average(average) - L
      //skip the eventually started bar if you cross a borderpixel
      if (ColorRange.inMaskRange(H, S, L)) {
        newBar = true
        start = true
      //from white to black and the sequence is already started
      } else if (contrast > 70 && !start) {
        count = 1
        average = [L, L, L]
        scanned++
      //from black to white and the sequence is already started
      } else if (contrast < -70 && !start) {
        count = 1
        average = [L, L, L]
        scanned++
      // sequences not started yet
      } else if (contrast > 70 && start) {
        average = [L, L, L]
      } else if (contrast < -70 && start) {
        average = [L, L, L]
      //from grey to black or white
      } else if (Math.abs(contrast) > 33) {
        //beginning of a sequence
        if (newBar) {
          newBar = false
          average = [L, L, L]
        //sequence was already started
        } else if (!newBar && start) {
          white = L > 50
          count = 1
          average = [L, L, L]
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
        average.shift()
        average.push(L)
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

  static average(list){
    let sum = 0
    for(let i = 0; i < list.length; i++){
      sum += list[i]
    }
    return sum/list.length
  }

  // this is to test on a small list see 'BarcodeScannerTest.js", values of 20 represent borders in original picture
  static testBar(list) {
    let scanned = 0
    let barcodes = {}
    let average = -20
    let count = 1
    let newBar = true
    let start = true
    let white = true
    let contrast
    for (let i = 1; i < list.length; i += 1) {
      let L = list[i]
      if(L === 20) {
        newBar = true
        start = true
      }
      contrast = average - L
      if (contrast > 70 && !start) {
        //from white to black
        count = 1
        average = L
        scanned++
      } else if (contrast < -70 && !start) {
        //from black to white
        count = 1
        average = L
        scanned++
      } else if ( contrast > 70 && start) {
        average = L
      } else if (contrast < -70 && start) {
        average = L
      } else if (Math.abs(contrast) > 33) {
        if (newBar) {
          newBar = false
          average = L
        } else if (!newBar && start) {
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
          newBar = true
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

  /**
   * Pre-process the image for better barcode decoding
   * 
   * @param {ImageData} imageObject 
   */
  static preProcessBarcode(imageObject) {
    let [min, max] = this.getMaxMinValues(imageObject)

    // console.log("min en max: ", min, max)

    let result = this.applyLevelsAdjustment(imageObject, min, max)

    // console.log("min en max: ", this.getMaxMinValues(result))

    return result
  }

  /**
   * Get max and min L values from the given image
   * 
   * Optional: use start and end constants to limit search domain
   * 
   * @param {ImageData} imageObject 
   */
  static getMaxMinValues(imageObject) {
    let max = 0
    let min = Infinity

    let pixels = imageObject.data
    let start = Math.floor(pixels.length / 3)
    let end = Math.ceil(pixels.length * 2 / 3)
    for (let i = 0; i < pixels.length; i += 4) {
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
   * Apply Histogram equilization with extra CONTRAST constant
   *
   * @param {Array} arr pixel array TODO: uitbreiden naar matrix?
   * @param {int} min min grijswaarde : [0..100]
   * @param {int} max max grijswaarde : [0..100]
   */
  static applyLevelsAdjustment(imageObject, min, max) {
    const CONTRAST = 10;

    min += CONTRAST
    max -= CONTRAST
    
    const fac = 100 / (max - min);

    let arr = imageObject
    for (let i = 0; i < arr.data.length; i+=4) {
      arr.data[i + 2] = Math.min((arr.data[i + 2] - min) * fac, 100)
    }
    return arr;
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
