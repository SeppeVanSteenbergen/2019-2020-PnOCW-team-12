import ColorRange from './ColorRange'

export default class BarcodeScanner {

  static barcodeAmount = 4 //amount of barcodes shown on each slave screen.

  static scan(imageObject, width, height) {
    let horThresh = Math.ceil(width/(27*10)) //html heeft 27 baren en dan moet 10 procent van een bar gedetecteerd worden
    let verThresh = Math.ceil(height/(27*10))
    let hor = this.scanHorizontal(imageObject, horThresh)
    let ver = this.scanVertical(imageObject, verThresh)
    let maxRatio = Math.max(hor[2], ver[2])
    if (hor[2] === maxRatio && maxRatio >= 0) {
      return hor[0]
    } else if (maxRatio >= 0) return ver[0]
  }

  static scanHorizontal(imageObject, threshold) {
    let height = imageObject.height
    let image = imageObject.data

    let scanned = []
    let barcodes = {}

    let red = 1
    let yellow = 2
    let green = 3
    let blue = 4
    let pink = 5

    for (let i = 0; i < image.length; i += 4) {

      let temp = []
      // Color + code: Red = 1; Yellow = 2; Green = 3; Blue = 4; Pink = 5
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
      } else if (ColorRange.inRedRange(H, S, L)) {

        if (temp[temp.length - 1] === red) {
          if (temp.length + 1 === threshold && !scanned.includes(red)) {
            scanned.push(red)
            temp = []
          } else temp.push(red)
        } else temp = [red]

      } else if (ColorRange.inYellowRange(H, S, L)) {

        if (temp[temp.length - 1] === yellow) {
          if (temp.length + 1 === threshold) {
            scanned.push(yellow)
            temp = []
          } else temp.push(yellow)
        } else temp = [yellow]

      } else if (ColorRange.inGreenRange(H, S, L)) {

        if (temp[temp.length - 1] === green) {
          if (temp.length + 1 === threshold && !scanned.includes(green)) {
            scanned.push(green)
            temp = []
          } else temp.push(green)
        } else temp = [green]

      } else if (ColorRange.inBlueRange(H, S, L)) {

        if (temp[temp.length - 1] === blue) {
          if (temp.length + 1 === threshold && !scanned.includes(blue)) {
            scanned.push(blue)
            temp = []
          } else temp.push(blue)
        } else temp = [blue]

      } else if (ColorRange.inPinkRange(H, S, L)) {

        if (temp[temp.length - 1] === pink) {
          if (temp.length + 1 === threshold && !scanned.includes(pink)) {
            scanned.push(pink)
            temp = []
          } else temp.push(pink)
        } else temp = [pink]
      }
    }

    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    let ratio = maxAmount / height / BarcodeScanner.barcodeAmount
    if (detectRatio < 0.5) {
      return [0, 0, 0]
    } else {
      let barcode = parseInt(
        Object.keys(barcodes)
          .find(key => barcodes[key] === maxAmount)
          .toString()
          .replace(/,/g, '')
      )
      return [barcode, ratio, detectRatio]
    }
  }

  static pixelToPosition(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4
  }

  static scanVertical(imageObject, threshold) {
    let height = imageObject.height
    let image = imageObject.data

    let scanned = []
    let barcodes = {}

    let red = 1
    let yellow = 2
    let green = 3
    let blue = 4
    let pink = 5

    for (let x = 0; x < imageObject.width; x++) {
      for (let y = 0; y < imageObject.height; y++) {

        let temp = []
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
        } else if (ColorRange.inRedRange(H, S, L)) {

          if (temp[temp.length - 1] === red) {
            if (temp.length + 1 === threshold && !scanned.includes(red)) {
              scanned.push(red)
              temp = []
            } else temp.push(red)
          } else temp = [red]

        } else if (ColorRange.inYellowRange(H, S, L)) {

          if (temp[temp.length - 1] === yellow) {
            if (temp.length + 1 === threshold) {
              scanned.push(yellow)
              temp = []
            } else temp.push(yellow)
          } else temp = [yellow]

        } else if (ColorRange.inGreenRange(H, S, L)) {

          if (temp[temp.length - 1] === green) {
            if (temp.length + 1 === threshold && !scanned.includes(green)) {
              scanned.push(green)
              temp = []
            } else temp.push(green)
          } else temp = [green]

        } else if (ColorRange.inBlueRange(H, S, L)) {

          if (temp[temp.length - 1] === blue) {
            if (temp.length + 1 === threshold && !scanned.includes(blue)) {
              scanned.push(blue)
              temp = []
            } else temp.push(blue)
          } else temp = [blue]

        } else if (ColorRange.inPinkRange(H, S, L)) {

          if (temp[temp.length - 1] === pink) {
            if (temp.length + 1 === threshold && !scanned.includes(pink)) {
              scanned.push(pink)
              temp = []
            } else temp.push(pink)
          } else temp = [pink]
        }
      }
    }

    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)

    let detectRatio = maxAmount / detectedAmount
    let ratio = maxAmount / height / BarcodeScanner.barcodeAmount
    if (detectRatio < 0.5) {
      return [0, 0, 0]
    } else {
      let barcode = parseInt(
        Object.keys(barcodes)
          .find(key => barcodes[key] === maxAmount)
          .toString()
          .replace(/,/g, '')
      )
      return [barcode, ratio, detectRatio]
    }
  }
}
