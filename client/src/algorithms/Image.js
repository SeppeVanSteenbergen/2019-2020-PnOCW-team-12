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
      this.imgOriginal = Image.copyImageData(imgData)
    }

    this.setPixels(imgData.data)
    this.setCanvas(canvasName, imgData.width, imgData.height)
    this.setColorSpace(colorSpace)

    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d')
      context.putImageData(imgData, 0, 0)
      this.drawer = new Drawer(
        this.getPixels(),
        this.getWidth(),
        this.getHeight(),
        this.canvas.getContext('2d')
      )
    }

    this.matrix = new Array(this.getHeight())
    for (let i = 0; i < this.getHeight(); i++) {
      this.matrix[i] = new Array(this.getWidth())
    }

    this.analyse()
  }

  static resizeImage(image, border) {
    let scaleWidth = border[0] / image.width
    let scaleHeight = border[1] / image.height
    let scale = Math.min(scaleWidth, scaleHeight)

    if (scale >= 1) {
      return image
    }

    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    canvas.width = image.width * scale
    canvas.height = image.height * scale
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    let resizedImage = document.createElement('img')
    resizedImage.src = canvas.toDataURL()
    resizedImage.width = canvas.width
    resizedImage.height = canvas.height

    return resizedImage
  }

  static resizeImageData(imgData, border) {
    let scaleWidth = border[0] / imgData.width
    let scaleHeight = border[1] / imgData.height
    let scale = Math.min(scaleWidth, scaleHeight)

    if (scale >= 1) {
      return imgData
    }

    let canvas = document.createElement('canvas')
    canvas.width = imgData.width * scale
    canvas.height = imgData.height * scale
    let ctx = canvas.getContext('2d')

    let copyCanvas = document.createElement('canvas')
    copyCanvas.width = imgData.width
    copyCanvas.height = imgData.height
    let copyCtx = copyCanvas.getContext('2d')
    copyCtx.putImageData(imgData, 0, 0)

    ctx.drawImage(copyCanvas, 0, 0, canvas.width, canvas.height)
    let resizedImgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    return resizedImgData
  }

  analyse() {
    ColorSpace.rgbaToHsla(this.pixels)
    this.setColorSpace('HSLA')

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
      console.error('colorspace ' + newColorSpace + ' doesn not exist!')
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
          if (this.isPossibleIsland(newIslandCoo)) {
            let newIsland = new Island(
              [newIslandCoo[0], newIslandCoo[1]],
              [newIslandCoo[2], newIslandCoo[3]],
              this.islandID,
              this.getImgData(),
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
    if (
      ids.includes(this.islandID) &&
      ids.includes(this.islandID + 1) & ids.includes(this.islandID + 2)
    )
      return true
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
      if (this.canvas !== null) {
        this.drawIsland(this.islands[i])
      }
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
      if (ColorRange.inBlueRange(H, S, L)) {
        this.matrix[y][x] = 1
      } else if (ColorRange.inGreenRange(H, S, L)) {
        this.matrix[y][x] = 2
      } else if (ColorRange.inRedRange(H, S, L)) {
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

  findExtremeValues(width, height) {
    let points = {
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

    if(height * scale < (points['maxy'] - points['miny'])){
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
  createPictureCanvas(w, h) {
    let pictureCanvas = this.findExtremeValues()

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

  showTransformatedImage(image) {
    let info = this.createPictureCanvas(image.width, image.height)

    let transformatedStyles = []
    for (let i = 0; i < this.screens.length; i++) {
      let h = this.screens[i].cssMatrix
      let t =
        'position: absolute; left:' +
        info.minx +
        'px; top: ' +
        info.miny +
        'px; transform: matrix3d(' +
        h.join(', ') +
        '); transform-origin: ' +
        -info.minx +
        'px ' +
        -info.miny +
        'px; width: ' +
        info.w +
        'px; height: ' +
        info.h +
        'px; object-fit: none'

      transformatedStyles.push(t)
    }

    if (this.canvas !== null) {
      for (let i = 0; i < transformatedStyles.length; i++) {
        let outputCanvas = document.getElementById('output' + (i + 1))
        outputCanvas.style = transformatedStyles[i]
        let outputContext = outputCanvas.getContext('2d')
        outputCanvas.width = info.w
        outputCanvas.height = info.h
        outputContext.drawImage(
          image,
          0,
          0,
          outputCanvas.width,
          outputCanvas.height
        )
      }
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
    let canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    let context = canvas.getContext('2d')
    let imgData = context.createImageData(
      this.width,
      this.height
    )
    imgData.data.set(this.pixels)
    return imgData
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
