class Image {
  constructor(imgData, colorSpace, clientInfo) {
    this.clientInfo = clientInfo
    // this.setCommunicator(communicator)
    this.colorSpaces = ['RGBA', 'HSLA', 'BW']
    this.islandID = 4 //jumps per three so we can save green and blue within an island.
    this.screens = []
    this.pictureCanvas = null
    this.imgData = imgData
    this.width = imgData.width
    this.height = imgData.height
    this.islands = []
    this.offSet = 1

    if (colorSpace === 'RGBA') {
      if (typeof ImageAlg !== 'undefined') {
        // eslint-disable-next-line no-undef
        this.imgOriginalRGB = ImageAlg.copyImageData(imgData)
      } else {
        this.imgOriginalRGB = Image.copyImageData(imgData)
      }
    }

    this.setPixels(imgData.data)
    this.setColorSpace(colorSpace)

    this.matrix = new Array(this.getHeight())
    for (let i = 0; i < this.getHeight(); i++) {
      this.matrix[i] = new Array(this.getWidth())
    }

    this.analyse()
  }

  analyse() {
    ColorSpace.rgbaToHsla(this.pixels)
    this.setColorSpace('HSLA')

    self.postMessage({
      text: 'UPDATE',
      pct: 10,
      msg: 'Converted Colorspace To HSLA'
    })

    this.createBigMask()

    self.postMessage({
      text: 'UPDATE',
      pct: 10,
      msg: 'Created Value Matrix from Image'
    })

    this.createOffset(this.offSet)
    this.createScreens()

    self.postMessage({ text: 'UPDATE', pct: 60, msg: 'Created Screens' })

    return this.screens
  }

  setCanvas(canvasName, width, height) {
    this.canvas = document.getElementById(canvasName)
    if (this.canvas !== null) {
      this.canvas.width = width
      this.canvas.height = height
    }
  }

  setColorSpace(newColorSpace) {
    if (!this.colorSpaces.includes(newColorSpace)) {
      console.error('colorspace ' + newColorSpace + ' doesn not exist!')
    }
    this.colorSpace = newColorSpace
  }

  //only call on mainthread!
  show() {
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d')
      context.putImageData(this.getImgData(), 0, 0)

      this.drawer._finishLines()
    }
  }

  calcIslandsFloodfill() {
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        if (this.checkId(x, y)) {
          let newIslandCoo = this.floodfill(x, y, this.islandID)
          if (this.isPossibleIsland(newIslandCoo)) {
            try {
              let newIsland = new Island(
                [newIslandCoo[0], newIslandCoo[1]],
                [newIslandCoo[2], newIslandCoo[3]],
                this.islandID,
                this.getImgData(),
                this.imgOriginalRGB,
                this.matrix
              )
              console.log('Island ' + this.islandID + 'is valid')
              newIsland.finishIsland()
              this.islands.push(newIsland)
            } catch (err) {
              self.postMessage({
                text: 'ERROR',
                msg: err + ' in island: ' + this.getRealIslandID()
              })
              console.log('Error :' + err + this.getRealIslandID())
            }
            this.islandID += 3
          }
        }
      }
    }
  }

  floodfill(xPos, yPos, islandID) {
    let stack = [[xPos, yPos]]
    let pixel
    let x
    let y
    let minX = xPos
    let minY = yPos
    let maxX = xPos
    let maxY = yPos
    while (stack.length > 0) {
      pixel = stack.pop()
      x = pixel[0]
      y = pixel[1]
      if (this.getMatrix(x, y) <= 3) {
        this.matrix[y][x] += islandID - 1
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
        if (this.checkId(x - 1, y)) {
          stack.push([x - 1, y])
        }
        if (this.checkId(x + 1, y)) {
          stack.push([x + 1, y])
        }
        if (this.checkId(x, y - 1)) {
          stack.push([x, y - 1])
        }
        if (this.checkId(x, y + 1)) {
          stack.push([x, y + 1])
        }
      }
    }
    return [minX, minY, maxX, maxY]
  }

  isPossibleIsland(coo) {
    let minx = coo[0]
    let miny = coo[1]
    let maxx = coo[2]
    let maxy = coo[3]

    let matrix = this.matrix.slice(miny, maxy)
    for (let i = 0; i < maxy - miny; i++) {
      matrix[i] = matrix[i].slice(minx, maxx)
    }

    let ids = matrix.flat()
    return ids.includes(this.islandID) && ids.includes(this.islandID + 1)
  }

  /**
   * Check if the position belongs to the formed island.
   * @param x
   * @param y
   * @returns {boolean}
   */
  checkId(x, y) {
    return (
      this.getMatrix(x, y) === 1 ||
      this.getMatrix(x, y) === 2 ||
      this.getMatrix(x, y) === 3
    )
  }

  /**
   * Creates the screens by detecting them in the image using the floodfill algorithm.
   */
  createScreens() {
    this.screens = []
    try {
      this.calcIslandsFloodfill()
    } catch (err) {
      self.postMessage({ text: 'ERROR', msg: err })
    }
    self.postMessage({
      text: 'UPDATE',
      pct: 20,
      msg: 'Floodfill done: found ' + this.getRealIslandID() + ' island(s)'
    })

    for (let i = 0; i < this.islands.length; i++) {
      let newScreen = this.islands[i].createScreen(this.clientInfo)
      this.screens.push(newScreen)
    }
  }

  /**
   * Create the value matrix, set coordinates with the correct color to the associated value.
   */
  createBigMask() {
    if (this.getColorSpace() !== 'HSLA') {
      console.error('createBigMask only with HSLA as colorspace!')
    }
    for (let i = 0; i < this.pixels.length; i += 4) {
      let H = this.pixels[i] * 2
      let S = this.pixels[i + 1]
      let L = this.pixels[i + 2]
      let pixel = this.positionToPixel(i)
      let x = pixel[0]
      let y = pixel[1]
      if (ColorRange.checkColor(H, S, L, 'blueGreen')) {
        this.matrix[y][x] = 1
      } else if (ColorRange.checkColor(H, S, L, 'yellow')) {
        this.matrix[y][x] = 2
      } else if (ColorRange.checkColor(H, S, L, 'purple')) {
        this.matrix[y][x] = 3
      } else {
        this.matrix[y][x] = 0
      }
    }
  }

  /**
   * Returns the value from the matrix of the given coordinate.
   * @param x
   *        x position of the coordinate.
   * @param y
   *        y position of the coordinate.
   * @returns {number}
   *          The value of that pixel in the matrix
   */
  getMatrix(x, y) {
    if (x < 0 || x >= this.width) return -1
    if (y < 0 || y >= this.height) return -1
    return this.matrix[y][x]
  }

  /**
   * Returns the coordinate in the matrix of the given position in the pixel array.
   * @param position
   *        The position of the element in the pixel array.
   * @returns {[number, number]}
   *          The x and y of the coordinate in an array.
   */
  positionToPixel(position) {
    position /= 4
    let x = position % this.getWidth()
    let y = (position - x) / this.getWidth()
    return [x, y]
  }

  pixelToPosition(x, y) {
    return this.getWidth() * y + x
  }

  /**
   * Use the drawer class to drawSnow the corners and midpoint of this island on the original imageData.
   *
   * @param island
   *        the island to be drawn
   */
  drawIsland(island) {
    this.drawer.drawMid(island)
    this.drawer.drawCorners(island)
  }

  static findExtremeValues(width, height, screens) {
    let points = {
      minx: null,
      maxx: null,
      miny: null,
      maxy: null,
      scale: 1
    }

    let allCorners = []

    screens.forEach(function(e) {
      for (let key in e.corners) {
        allCorners.push(e.corners[key])
      }
    })

    //sort on x co
    allCorners.sort(function(a, b) {
      return a[0] - b[0]
    })

    points['minx'] = allCorners[0][0]
    points['maxx'] = allCorners[allCorners.length - 1][0]

    //sort on y co
    allCorners.sort(function(a, b) {
      return a[1] - b[1]
    })

    points['miny'] = allCorners[0][1]
    points['maxy'] = allCorners[allCorners.length - 1][1]

    let scale = width / (points['maxx'] - points['minx'])

    if (height * scale < points['maxy'] - points['miny']) {
      scale = height / (points['maxy'] - points['miny'])
    }

    points['scale'] = scale

    return points
  }

  /**
   * map the the given image size around the found screens
   *
   * @param {int} w image width
   * @param {int} h image height
   */
  static createPictureCanvas(w, h, screens) {
    let pictureCanvas = Image.findExtremeValues(w, h, screens)

    w = Math.abs(pictureCanvas.maxx - pictureCanvas.minx)
    h = Math.abs(pictureCanvas.maxy - pictureCanvas.miny)

    return {
      w: w,
      h: h,
      minx: pictureCanvas.minx,
      miny: pictureCanvas.miny,
      maxx: pictureCanvas.maxx,
      maxy: pictureCanvas.maxy,
      scale: pictureCanvas.scale
    }
  }

  /**
   * Recalculate every screen's corner to match up with the mapped image pixels
   */
  calcRelativeScreens() {
    let originX = this.pictureCanvas.minx
    let originY = this.pictureCanvas.miny
    this.screens.forEach(function(s) {
      for (let key in s.corners) {
        if (s.corners.hasOwnProperty(key)) {
          s.relativeCorners[key][0] = s.corners[key][0] - originX
          s.relativeCorners[key][1] = s.corners[key][1] - originY
        }
      }
    })
  }

  /**
   * Makes
   *
   * @param factor
   */
  createOffset(factor) {
    let whites = []
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        if (this.getMatrix(x, y) > 0) {
          whites.push([x, y])
        }
      }
    }
    for (let i = 0; i < whites.length; i++) {
      for (let yBox = -factor; yBox <= factor; yBox++) {
        for (let xBox = -factor; xBox <= factor; xBox++) {
          let x = whites[i][0]
          let y = whites[i][1]
          let value = this.getMatrix(x, y)
          if (
            y + yBox >= 0 &&
            y + yBox < this.getHeight() &&
            x + xBox >= 0 &&
            x + xBox < this.getWidth() &&
            this.getMatrix(x + xBox, y + yBox) === 0
          ) {
            this.matrix[y + yBox][x + xBox] = value
          }
        }
      }
    }
  }

  /**
   * Clone an ImageData Object
   * @param src
   *        Source ImageData object
   * @returns {ImageData}
   *        Copy of given ImageData object
   */
  static copyImageData(src) {
    return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height)
  }

  /**
   * Get all the data of the image
   * @returns {*|ImageData}
   */
  getImgData() {
    return this.imgData
  }

  getRealIslandID() {
    return parseInt(Math.floor(this.islandID / 3)) - 1
  }

  getColorSpace() {
    return this.colorSpace
  }

  getHeight() {
    return this.height
  }

  getWidth() {
    return this.width
  }

  setPixels(pixels) {
    this.pixels = pixels
  }

  getPixels() {
    return this.pixels
  }
}
