import Screen from './Screen'
import BarcodeScanner from './BarcodeScanner'
import CornerDetector from './CornerDetector'
import Line from './Line'
import PermutationConverter from './PermutationConverter'

export default class Island {
  /**
   * Create and Island starting with this pixel
   * @param leftUpperCoo
   * @param rightBottomCoo
   * @param {int} id
   * @param imgOriginal
   * @param matrix
   */
  constructor(leftUpperCoo, rightBottomCoo, id, imgOriginal, matrix) {
    // coordinates seen from original matrix
    this.corners = {
      LU: null,
      RU: null,
      RD: null,
      LD: null
    }

    this.minx = leftUpperCoo[0]
    this.maxx = rightBottomCoo[0]

    this.miny = leftUpperCoo[1]
    this.maxy = rightBottomCoo[1]

    this.setScreenMatrix(matrix)
    this.height = this.screenMatrix.length
    this.width = this.screenMatrix[0].length

    this.id = id
    this.yellow = id
    this.pink = id + 1
    this.circle = id + 2

    this.imgOriginal = imgOriginal
    this.midPoint = this.calcMid()
    this.barcode = BarcodeScanner.scan(this.getScreenImg())
    this.clientCode = PermutationConverter.decode(this.barcode)
  }

  isValid() {
    return this.midPoint !== null && this.barcode !== 0
  }

  setScreenMatrix(matrix) {
    this.screenMatrix = matrix.slice(this.miny, this.maxy)
    for (let i = 0; i < this.maxy - this.miny; i++) {
      this.screenMatrix[i] = this.screenMatrix[i].slice(this.minx, this.maxx)
    }
  }

  findCorners() {
    let cornerDetector = new CornerDetector(
      this.screenMatrix,
      this.midPoint,
      this.id
    )
    let detectedCorners = cornerDetector.cornerDetection()
    this.corners.LU = [
      detectedCorners.LU[0],
      detectedCorners.LU[1],
      detectedCorners.LU[2]
    ]
    this.corners.LD = [
      detectedCorners.LD[0],
      detectedCorners.LD[1],
      detectedCorners.LD[2]
    ]
    this.corners.RU = [
      detectedCorners.RU[0],
      detectedCorners.RU[1],
      detectedCorners.RU[2]
    ]
    this.corners.RD = [
      detectedCorners.RD[0],
      detectedCorners.RD[1],
      detectedCorners.RD[2]
    ]
  }

  calcMid() {
    let xValues = []
    let yValues = []

    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        if (this.getMatrix(x, y) === this.circle) {
          xValues.push(x)
          yValues.push(y)
        }
      }
    }

    if (xValues.length === 0 || yValues.length === 0) {
      return null
    }

    xValues = Island.filterPoints(xValues)
    yValues = Island.filterPoints(yValues)

    return [
      xValues[Math.round(xValues.length / 2)],
      yValues[Math.round(yValues.length / 2)]
    ]
  }

  static filterPoints(input) {
    if (input.length <= 3) {
      return input
    }

    let values = input.sort(function(a, b) {
      return a - b
    })

    let slices = []
    let prev = values[0]
    for (let i = 0; i < values.length; i++) {
      const v = values[i]

      if (v - prev > 3) {
        slices.push(i)
      }

      prev = v
    }

    let result = []

    let startSlice = 0
    for (let i = 0; i < slices.length; i++) {
      const s = slices[i]
      let tmp = values.slice(startSlice, s)
      if (tmp.length > result.length) {
        result = tmp
      }

      startSlice = s
    }

    if (result.length === 0) {
      return values
    }

    return result
  }

  cssTransMatrix(transMatrix) {
    return [
      transMatrix[1][1],
      transMatrix[2][1],
      0,
      transMatrix[3][1],
      transMatrix[1][2],
      transMatrix[2][2],
      0,
      transMatrix[3][2],
      0,
      0,
      1,
      0,
      transMatrix[1][3],
      transMatrix[2][3],
      0,
      [transMatrix[3][3]]
    ]
  }

  finishIsland() {
    this.findCorners()
    if (this.islandIsFlipped()) {
      this.barcode = parseInt(
        this.barcode
          .toString()
          .split('')
          .reverse()
          .join('')
      )
      this.clientCode = PermutationConverter.decode(this.barcode)
    }
    this.localToWorld()
    console.log(this.barcode)
    console.log(this.midPoint, this.corners)
  }

  islandIsFlipped() {
    let topLine = new Line(this.corners.LU, this.corners.RU)
    let angle = topLine.angle

    // TODO: Check randgevallen (45 en 255)
    return angle > 45 && angle < 225
  }

  localToWorld() {
    this.midPoint = [this.midPoint[0] + this.minx, this.midPoint[1] + this.miny]
    this.corners.LU = [
      this.corners.LU[0] + this.minx,
      this.corners.LU[1] + this.miny,
      this.corners.LU[2]
    ]
    this.corners.LD = [
      this.corners.LD[0] + this.minx,
      this.corners.LD[1] + this.miny,
      this.corners.LD[2]
    ]
    this.corners.RU = [
      this.corners.RU[0] + this.minx,
      this.corners.RU[1] + this.miny,
      this.corners.RU[2]
    ]
    this.corners.RD = [
      this.corners.RD[0] + this.minx,
      this.corners.RD[1] + this.miny,
      this.corners.RD[2]
    ]
  }

  createScreen(clientInfo) {
    let corners = this.corners

    return new Screen(
      corners,
      this.midPoint,
      clientInfo,
      this.clientCode,
      this.imgOriginal
    )
  }

  getMatrix(x, y) {
    if (x < 0 || x >= this.width) return 0
    if (y < 0 || y >= this.height) return 0
    return this.screenMatrix[y][x]
  }

  getScreenImg() {
    let canvas = document.createElement('canvas')
    canvas.width = this.imgOriginal.width
    canvas.height = this.imgOriginal.height
    let context = canvas.getContext('2d')
    context.putImageData(this.imgOriginal, 0, 0)
    return context.getImageData(
      this.minx,
      this.miny,
      this.maxx - this.minx,
      this.maxy - this.miny
    )
  }

  getHeight() {
    return this.height
  }

  getWidth() {
    return this.width
  }

  getSize() {
    return this.width * this.height
  }

  print() {
    console.log('starting co: ' + this.minx + ', ' + this.miny)
    console.log('ending co: ' + this.maxx + ', ' + this.maxy)
  }
}
