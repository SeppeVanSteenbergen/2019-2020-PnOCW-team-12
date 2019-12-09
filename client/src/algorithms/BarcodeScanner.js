import ColorRange from './ColorRange'

export default class BarcodeScanner {
  static scan(imageObject) {
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

    let scanned = []
    let barcodes = {}
 let comma = false
    for (let i = 0; i < image.length; i += 4) {
      // Color + code: Red = 1; Yellow = 2; Green = 3; Blue = 4; Pink = 5
      let H = 0
      let S = image[i + 1]
      let L = image[i + 2]
     
      if (!comma && ColorRange.inSepRange(H, S, L)) {
        if (barcodes[scanned] === undefined) {
          barcodes[scanned] = 1
        } else {
          barcodes[scanned] += 1
        }
        scanned = []
        comma = true
      } else if (ColorRange.inZeroRange(H, S, L) && comma) {
        scanned.push(0)
        comma = false
      } else if (ColorRange.inOneRange(H, S, L) && comma) {
        scanned.push(1)
        comma = false
      } else if (ColorRange.inCommaRange(H,S,L)){
        comma = true
      }
    }

    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    //TODO: Needs to be updated with the right amount of barcodes on screen.
    let ratio = maxAmount / height / 10
    if (detectRatio < 0.5) {
      // console.log('Picture is not good enough to detect barcode horizontal');
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
      return [barcode, ratio, detectRatio]
    }
  }

  static pixelToPosition(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4
  }

  /**
   * TODO: waar max en min uitlezen, in welke matrix read + over alle pixels?
   * 
   * @param {Array} arr pixel array TODO: uitbreiden naar matrix?
   * @param {int} min min grijswaarde : [0..100]
   * @param {int} max max grijswaarde : [0..100]
   */
  static applyLevelsAdjustment(arr, min, max){
    let fac = (max - min) / 100;

    for (let i = 0; i < arr.length; i++) {
      arr[i] = (arr[i] - min) * fac;
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
  static scanHorizontalData(image, height) {

    let scanned = []
    let barcodes = {}
    let comma = true
    for (let i = 0; i < image.length; i += 4) {
      // Color + code: Red = 1; Yellow = 2; Green = 3; Blue = 4; Pink = 5
      let H = image[i]
      let S = image[i + 1]
      let L = image[i + 2]
     
      if (!comma && ColorRange.inSepRange(H, S, L)) {
        if (barcodes[scanned] === undefined) {
          barcodes[scanned] = 1
        } else {
          barcodes[scanned] += 1
        }
        scanned = []
        comma = true
      } else if (ColorRange.inOneRange(H, S, L) && comma) {
        scanned.push(1)
        comma = false
      } else if (ColorRange.inZeroRange(H, S, L) && comma) {
        scanned.push(0)
        comma = false
      } else if (ColorRange.inCommaRange(H,S,L)){
        comma = true
      }
    }
    console.log(barcodes)
    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    //TODO: Needs to be updated with the right amount of barcodes on screen.
    let ratio = maxAmount / height / 10
    if (detectRatio < 0.1) {
      // console.log('Picture is not good enough to detect barcode horizontal');
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
      return [barcode, detectRatio, detectedAmount]
    }
  }
}
