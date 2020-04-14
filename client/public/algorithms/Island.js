class Island {
  /**
   * Create and Island starting with this pixel
   * @param leftUpperCoo
   * @param rightBottomCoo
   * @param {int} id
   * @param HSLImage
   * @param RGBImage
   * @param matrix
   */
  constructor(leftUpperCoo, rightBottomCoo, id, HSLImage, RGBImage, matrix) {
    console.log('Start creating island with ID ' + id)
    // console.log('Start creating island with ID ' + id)
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

    this.id = id
    this.blue = id
    this.green = id + 1
    this.circle = id + 2

    this.setScreenMatrix(matrix)
    this.height = this.screenMatrix.length
    this.width = this.screenMatrix[0].length

    this.HSLImage = HSLImage
    this.RGBImage = RGBImage
    this.midPoint = this.calcMid()
    this.clientCode = null
    console.log('Island ' + id + ' created')
    // console.log('Island ' + id + ' created')
  }

  isValid() {
    return this.midPoint !== null
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
      this.id,
      null
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

    self.postMessage({
      text: 'MESSAGE',
      msg: 'Corners of screen in island ' + this.getRealID() + ' are all set'
    })
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

    console.log('Midpoint of island ' + this.getRealID() + ' calculated')
    self.postMessage({text: 'UPDATE', msg:'Midpoint of island ' + this.getRealID() + ' calculated'})
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

    let index = []
    let prev = values[0]
    for (let i = 0; i < values.length; i++) {
      const v = values[i]

      if (v - prev > 3) {
        index.push(i)
      }

      prev = v
    }

    let result = []
    let slices = []
    slices.push(values)
    let startSlice = 0
    for (let i = 0; i < index.length; i++) {
      let s = index[i]
      let piece = slices.pop()
      let tmp = piece.slice(startSlice, s)
      slices.push(piece.slice(s, piece.length - 1))
      if (tmp.length > result.length) {
        result = tmp
      }
      startSlice = s
    }
    if (slices[slices.length - 1].length > result.length) {
      result = slices[slices.length - 1]
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
    console.log('Try to identify island ' + this.id)
    this.findCorners()
    this.clientCode = RGBBarcodeScanner.scan(
      this.getScreenImgData(this.RGBImage),
      this.corners.LU,
      this.corners.RU
    )
    this.localToWorld()

    self.postMessage({
      text: 'MESSAGE',
      msg: 'Detected client code for screen ' + this.getRealID() + ': ' + this.clientCode
    })
    console.log('Detected screen: ' + this.clientCode)
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
      this.HSLImage
    )
  }

  getClientCode() {
    return this.clientCode
  }

  getMatrix(x, y) {
    if (x < 0 || x >= this.width) return 0
    if (y < 0 || y >= this.height) return 0
    return this.screenMatrix[y][x]
  }

  getScreenImg(image) {
    console.log('trying to get screen img from doc...')
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    let context = canvas.getContext('2d')
    context.putImageData(image, 0, 0)
    return context.getImageData(
      this.minx,
      this.miny,
      this.maxx - this.minx,
      this.maxy - this.miny
    )
  }

  getScreenImgData(image) {
    const w = image.width

    let result = []
    let rowCnt = 0
    for (let i = 0; i < image.data.length; i += 4 * w) {
      rowCnt++

      if (rowCnt >= this.miny) {
        const curRow = image.data.slice(i, i + w * 4)
        const part = Array.from(
          curRow.slice(this.minx * 4, (this.maxx - 1) * 4 + 4)
        )
        result = result.concat(part)
      }

      if (rowCnt >= this.maxy - 1) {
        break
      }
    }

    let arr = new Uint8ClampedArray(result)
    return new ImageData(arr, this.maxx - this.minx, this.maxy - this.miny)
  }

  getRealID() {
    return parseInt(Math.floor(this.id/3))-1
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

