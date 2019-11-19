import Island from './Island'
import Drawer from './Drawer'
import ColorSpace from './ColorSpace'
import ColorRange from './ColorRange'

export default class Image {
  constructor(imgData, canvasName, colorSpace, clientInfo) {
    this.clientInfo = clientInfo

    this.colorSpaces = ['RGBA', 'HSLA', 'BW']
    this.islandID = 4 //jumps per three so we can save green and blue within an island.
    this.screens = []
    this.pictureCanvas = null
    this.width = imgData.width
    this.height = imgData.height
    this.islands = []
    this.offSet = 1

    if (colorSpace === 'RGBA') {
      this.imgOriginal = imgData
    }

    this.setPixels(imgData.data)
    this.setCanvas(canvasName, imgData.width, imgData.height)
    this.setColorSpace(colorSpace)

    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d')
      context.putImageData(imgData, 0, 0)
    }
    this.drawer = new Drawer(
      this.getPixels(),
      this.getWidth(),
      this.getHeight(),
      this.canvas.getContext('2d')
    )

    this.matrix = new Array(this.getHeight())
    for (let i = 0; i < this.getHeight(); i++) {
      this.matrix[i] = new Array(this.getWidth())
    }

    this.analyse()
  }

  analyse() {
    ColorSpace.rgbaToHsla(this.pixels)
    this.setColorSpace('HSLA')
    // console.log("debug");
    // this.debugMask();
    // this.show();

    this.createBigMask()
    this.createOffset(this.offSet)
    this.createScreens()
    //this.createPictureCanvas(300, 500); //TODO: param meegeven
    //this.calcRelativeScreens(); //untested
    return this.screens
  }

  //TODO: check resolution ook
  qualityCheck() {
    let RGBA = false
    if (this.getColorSpace() === 'RGBA') {
      ColorSpace.rgbaToHsla(this.pixels)
      this.setColorSpace('HSLA')
      RGBA = true
    }
    if (this.getColorSpace() !== 'HSLA') {
      console.error('Picture has to be in HSLA to do a quality check!')
    } else {
      let luminance = ColorSpace.calcLuminance(this.pixels)
      if (luminance < 40 || luminance > 80) {
        console.error('Take a better picture')
      }
    }
    if (RGBA) {
      ColorSpace.hslaToRgba(this.pixels)
      this.setColorSpace('RGBA')
    }
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
      console.error("colorspace '" + newColorSpace + "' doesn't exist!")
    }
    this.colorSpace = newColorSpace
  }

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
          if (
            (newIslandCoo[0] - newIslandCoo[2]) *
              (newIslandCoo[1] - newIslandCoo[3]) <=
            1000
          )
            break
          let newIsland = new Island(
            [newIslandCoo[0], newIslandCoo[1]],
            [newIslandCoo[2], newIslandCoo[3]],
            this.islandID,
            this.imgOriginal,
            this.matrix
          )
          if (newIsland.isValid()) {
            try {
              newIsland.finishIsland()
              this.islands.push(newIsland)
            } catch (err) {
              console.log(err + ' in screen: ' + newIsland.getBarcode())
            }
          }
          this.islandID += 3
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
    this.calcIslandsFloodfill()
    for (let i = 0; i < this.islands.length; i++) {
      this.drawIsland(this.islands[i])
      let newScreen = this.islands[i].createScreen(this.clientInfo)
      this.screens.push(newScreen)
    }
  }

  /**
   * Create the value matrix, set coordinates with the correct color to the associated value.
   */
  createBigMask() {
    if (this.getColorSpace() !== 'HSLA') {
      console.error('createGreenBlueMask only with HSLA as colorspace!')
    }
    for (let i = 0; i < this.pixels.length; i += 4) {
      let H = this.pixels[i] * 2
      let S = this.pixels[i + 1]
      let L = this.pixels[i + 2]
      let pixel = this.positionToPixel(i)
      let x = pixel[0]
      let y = pixel[1]
      if (ColorRange.inYellowRange(H, S, L)) {
        this.matrix[y][x] = 1
      } else if (ColorRange.inPinkRange(H, S, L)) {
        this.matrix[y][x] = 2
      } else if (ColorRange.inMidRange(H, S, L)) {
        this.matrix[y][x] = 3
      } else {
        this.matrix[y][x] = 0
      }
    }
  }

  debugMask() {
    if (this.getColorSpace() !== 'HSLA') {
      console.error('createGreenBlueMask only with HSLA as colorspace!')
    }
    for (let i = 0; i < this.pixels.length; i += 4) {
      let H = this.pixels[i] * 2
      let S = this.pixels[i + 1]
      let L = this.pixels[i + 2]

      if (ColorRange.inYellowRange(H, S, L)) {
        this.pixels[i + 2] = 100
      } else if (ColorRange.inPinkRange(H, S, L)) {
        this.pixels[i + 2] = 100
      } else if (ColorRange.inMidRange(H, S, L)) {
        this.pixels[i + 2] = 100
      } else {
        this.pixels[i + 2] = 0
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

  /**
   * Use the drawer class to draw the corners and midpoint of this island on the original imageData.
   *
   * @param island
   *        the island to be drawn
   */
  drawIsland(island) {
    this.drawer.drawMid(island)
    this.drawer.drawCorners(island)
  }

  /**
   * map the the given image size around the found screens
   *
   * @param {int} w image width
   * @param {int} h image height
   */
  createPictureCanvas(w, h) {
    this.pictureCanvas = {
      minx: null,
      maxx: null,
      miny: null,
      maxy: null,
      scale: 1
    }

    let allCorners = []

    this.screens.forEach(function(e) {
      for (let key in e.corners) {
        allCorners.push(e.corners[key])
      }
    })

    //sort on x co
    allCorners.sort(function(a, b) {
      return a[0] >= b[0]
    })

    this.pictureCanvas['minx'] = allCorners[0][0]
    this.pictureCanvas['maxx'] = allCorners[allCorners.length - 1][0]

    //sort on y co
    allCorners.sort(function(a, b) {
      return a[1] >= b[1]
    })

    this.pictureCanvas['miny'] = allCorners[0][1]
    this.pictureCanvas['maxy'] = allCorners[allCorners.length - 1][1]

    //scale image to min size containing all screens
    let pc = this.pictureCanvas
    if (pc.minx + w < pc.maxx) {
      let fac = (pc.maxx - pc.minx) / w
      w = w * fac
      h = h * fac
    }
    if (pc.miny + h < pc.maxy) {
      let fac = (pc.maxy - pc.miny) / h
      w = w * fac
      h = h * fac
    }

    this.pictureCanvas.maxx = pc.minx + w
    this.pictureCanvas.maxy = pc.miny + h
    this.pictureCanvas.scale =
      (this.pictureCanvas.maxx - this.pictureCanvas.minx) / w

    return w, h
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
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d')
      let imgData = context.createImageData(
        this.canvas.width,
        this.canvas.height
      )
      imgData.data.set(this.pixels)
      return imgData
    } else {
      return this.imgOriginal.data
    }
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
