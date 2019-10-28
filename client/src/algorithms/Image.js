import PermutationConverter from './numberConverter'
import Island from './Island'
import Screen from './Screen'

module.exports = class Image {
  pixels
  canvas
  colorSpace

  sensitivity = 30
  colorSpaces = ['RGBA', 'HSLA', 'BW']

  corners = []

  islands
  tmpIslands = []
  islandID = 3 //jumps per two so we can save green and blue within an island.
  MIN_ISLAND_SIZE = 1000

  matrix
  screens = []
  imgData

  width
  height

  lowerBoundG = [120 - this.sensitivity, 50, 25]
  upperBoundG = [120 + this.sensitivity, 100, 75]
  lowerBoundB = [240 - this.sensitivity, 50, 25]
  upperBoundB = [240 + this.sensitivity, 100, 75]

  constructor(imgData, canvasName, colorSpace, width, height) {
    this.setPixels(imgData.data)
    this.setCanvas(canvasName, imgData.width, imgData.height)
    this.setColorSpace(colorSpace)
    this.width = width
    this.height = height
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d')
      context.putImageData(imgData, 0, 0)
    }

    this.islands = []
    this.matrix = new Array(this.getHeight())
    for (let i = 0; i < this.getHeight(); i++) {
      this.matrix[i] = new Array(this.getWidth())
    }
  }

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
      return this.imgData
    }
  }

  /**
   * Execute all the calulations to analyse the whole image
   */
  doCalulations() {
    this.rgbaToHsla()
    this.createGreenBlueMask()
    this.medianBlurMatrix(3)
    this.createScreens()
    for (let i = 0; i < this.screens.length; i++) {
      this.screens[i].findClientCode()
      this.screens[i].calculateScreenImage(this.imgData)
    }
  }

  /**
   * Returns all the data from screens and main without images
   */
  getAllData() {
    return true
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
    if (this.matrix[y][x + 1] === 1 || this.matrix[y][x + 1] === 2) {
      stack.push([x + 1, y])
    }
    if (this.matrix[y - 1][x] === 1 || this.matrix[y - 1][x] === 2) {
      stack.push([x, y - 1])
    }
    if (this.matrix[y + 1][x] === 1 || this.matrix[y + 1][x] === 2) {
      stack.push([x, y + 1])
    }
  }
  /* for (let i = 0; i < tmpIslands.length; i++) {
      if (tmpIslands[i].size() > this.MIN_ISLAND_SIZE) {
          this.drawFillRect([tmpIslands[i].minx, tmpIslands[i].miny], [tmpIslands[i].maxx, tmpIslands[i].maxy], 0.3);
          //tmpIslands[i].cornerDetection();
          //let corners = tmpIslands[i].findScreenCorners();
          //for(let j = 0; j < 4; j++) this.drawPoint(corners[j][0] + tmpIslands[i].minx, corners[j][1]+tmpIslands[i].miny, 10);
          this.islands.push(tmpIslands[i]);
      }
  } */

  show() {
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d')
      context.putImageData(this.getImgData(), 0, 0)
    }
  }

  calcIslandsFloodfill() {
    let tmpIslands = []
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        if (this.matrix[y][x] === 1 || this.matrix[y][x] === 2) {
          let newIslandCoo = this.floodfill(x, y, this.islandID)
          let newIsland = new Island(
            newIslandCoo[0],
            newIslandCoo[1],
            this.islandID
          )
          newIsland.add(newIslandCoo[2], newIslandCoo[3])
          newIsland.setScreenMatrix(this.matrix)
          tmpIslands.push(newIsland)
          this.islandID += 2
        }
      }
    }
    for (let i = 0; i < tmpIslands.length; i++) {
      if (tmpIslands[i].size() > this.MIN_ISLAND_SIZE) {
        this.drawFillRect(
          [tmpIslands[i].minx, tmpIslands[i].miny],
          [tmpIslands[i].maxx, tmpIslands[i].maxy],
          0.3
        )
        let corners = tmpIslands[i].Corners()
        for (let j = 0; j < 4; j++)
          this.drawPoint(
            corners[j][0] + tmpIslands[i].minx,
            corners[j][1] + tmpIslands[i].miny,
            10
          )
        this.islands.push(tmpIslands[i])
      }
    }
  }

  floodfill(xPos, yPos, islandID) {
    var stack = [[xPos, yPos]]
    var pixel
    var x
    var y
    var minX = xPos
    var minY = yPos
    var maxX = xPos
    var maxY = yPos
    while (stack.length > 0) {
      pixel = stack.pop()
      x = pixel[0]
      y = pixel[1]
      if (this.matrix[y][x] <= 2) {
        this.matrix[y][x] += islandID - 1
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
        if (this.matrix[y][x - 1] === 1 || this.matrix[y][x - 1] === 2) {
          stack.push([x - 1, y])
        }
        if (this.matrix[y][x + 1] === 1 || this.matrix[y][x + 1] === 2) {
          stack.push([x + 1, y])
        }
        if (this.matrix[y - 1][x] === 1 || this.matrix[y - 1][x] === 2) {
          stack.push([x, y - 1])
        }
        if (this.matrix[y + 1][x] === 1 || this.matrix[y + 1][x] === 2) {
          stack.push([x, y + 1])
        }
      }
    }
    return [minX, minY, maxX, maxY]
  }

  createScreens() {
    this.screens.length = 0
    this.calcIslandsFloodfill()
    let newScreen
    for (let i = 0; i < this.islands.length; i++) {
      newScreen = this.islands[i].createScreen()
      this.screens.push(newScreen)
    }
  }

  filterIslands() {
    for (let i; i <= this.tmpIslands; i++) {}
  }

  countEdges(island) {
    let count = 0
    let up = this.matrix[island.getMiny()][
      Math.floor((island.getMaxx() - island.getMinx()) / 2)
    ]
    let down = this.matrix[island.getMaxy()][
      Math.floor((island.getMaxx() - island.getMinx()) / 2)
    ]
    let left = this.matrix[
      Math.floor((island.getMaxy() - island.getMiny()) / 2)
    ][island.getMinx()]
    let right = this.matrix[
      Math.floor((island.getMaxy() - island.getMiny()) / 2)
    ][island.getMaxx()]
    if (up !== 0) {
      count++
    }
    if (down !== 0) {
      count++
    }
    if (left !== 0) {
      count++
    }
    if (right !== 0) {
      count++
    }
    return count
  }

  /**
   * @param {HTMLCanvasElement} canvas canvas om imgdata op te pushen
   */
  /**
 matrixToImg(canvas) {

        let data = context.createImageData(this.getWidth(), this.getHeight());

        for (let j = 0; j < this.canvas.height; j++) {
            for (let i = 0; i < this.canvas.width; i++) {
                let pos = this.positionToPixel(i, j);
                newData[pos], newData[pos + 1] = 0;
                newData[pos + 2] = this.matrix[j][i];
            }
        }

        let img = new Image(newData, canvas, "HSL");

        img.hslaToRgba();

        return img;
    }
 */

  /*
      math from https://www.rapidtables.com/convert/color/rgb-to-hsl.html
  */
  rgbaToHsla() {
    for (let i = 0; i < this.pixels.length; i += 4) {
      //convert rgb spectrum to 0-1
      let red = this.pixels[i] / 255
      let green = this.pixels[i + 1] / 255
      let blue = this.pixels[i + 2] / 255

      let min = Math.min(red, green, blue)
      let max = Math.max(red, green, blue)

      let L = (min + max) / 2
      let S = this.findSaturation(min, max, L)
      let H = this.findHue(red, green, blue, max, min)

      this.pixels[i] = H / 2
      this.pixels[i + 1] = Math.round(S * 100)
      this.pixels[i + 2] = Math.round(L * 100)
    }
    this.setColorSpace('HSLA')
  }

  findSaturation(min, max, L) {
    if (L < 0.5) {
      return (max - min) / (max + min)
    } else {
      return (max - min) / (2.0 - max - min)
    }
  }

  findHue(red, green, blue, max, min) {
    let hue = 0
    if (max == min) {
      return 0
    } else if (red == max) {
      hue = (green - blue) / (max - min)
    } else if (green == max) {
      hue = 2.0 + (blue - red) / (max - min)
    } else if (blue == max) {
      hue = 4.0 + (red - green) / (max - min)
    }

    hue *= 60
    if (hue < 0) {
      hue += 360
    }
    return hue
  }

  /*
      image as Image
      math from: http://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
  */
  hslaToRgba() {
    let R
    let G
    let B
    let tmp1
    let tmp2
    let tmpR
    let tmpG
    let tmpB

    if (this.colorSpace !== 'HSLA') {
      console.error('Image has to be in HSLA to convert from HSLA to RGBA!')
    }
    for (let i = 0; i < this.pixels.length; i += 4) {
      let H = (this.pixels[i] * 2) / 360.0
      let S = this.pixels[i + 1] / 100.0
      let L = this.pixels[i + 2] / 100.0

      if (S === 0) {
        R = L
        G = L
        B = L
      } else {
        if (L < 0.5) {
          tmp1 = L * (1.0 + S)
        } else {
          tmp1 = L + S - L * S
        }
        tmp2 = 2 * L - tmp1

        tmpR = H + 1 / 3
        tmpR = this.setTemporaryInRange(tmpR)

        tmpG = H
        tmpG = this.setTemporaryInRange(tmpG)

        tmpB = H - 1 / 3
        tmpB = this.setTemporaryInRange(tmpB)

        R = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpR)
        G = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpG)
        B = this.hslaToRgbaCalculateColor(tmp1, tmp2, tmpB)
      }

      this.pixels[i] = Math.round(R * 255)
      this.pixels[i + 1] = Math.round(G * 255)
      this.pixels[i + 2] = Math.round(B * 255)
    }
    this.setColorSpace('RGBA')
  }

  setTemporaryInRange(temp) {
    if (temp > 1) {
      return temp - 1
    } else if (temp < 0) {
      return temp + 1
    }
    return temp
  }

  hslaToRgbaCalculateColor(tmp1, tmp2, tmpColor) {
    if (6 * tmpColor < 1) {
      return tmp2 + (tmp1 - tmp2) * 6 * tmpColor
    } else if (2 * tmpColor < 1) {
      return tmp1
    } else if (3 * tmpColor < 2) {
      return tmp2 + (tmp1 - tmp2) * (0.666 - tmpColor) * 6
    }
    return tmp2
  }

  /*
  image as Image
  mask color = white
  not in mask = black
  low = array[low Hue, low Saturation, low Luminance]
  high = array[""]
  */
  createMask(low, high) {
    for (let i = 0; i < this.pixels.length; i += 4) {
      let H = this.pixels[i] * 2
      let S = this.pixels[i + 1]
      let L = this.pixels[i + 2]

      if (
        H >= low[0] &&
        S >= low[1] &&
        L >= low[2] &&
        H <= high[0] &&
        S <= high[1] &&
        L <= high[2]
      ) {
        this.pixels[i + 1] = 0
        this.pixels[i + 2] = 100
      } else {
        this.pixels[i + 1] = 0
        this.pixels[i + 2] = 0
      }
    }
  }

  createGreenMask() {
    let lowerBound = [120 - this.sensitivity, 50, 25]
    let upperBound = [120 + this.sensitivity, 100, 75]
    this.createMask(lowerBound, upperBound)
  }

  createBlueMask() {
    let lowerBound = [240 - this.sensitivity, 50, 25]
    let upperBound = [240 + this.sensitivity, 100, 75]
    this.createMask(lowerBound, upperBound)
  }

  addImgData(imgData) {
    let pixelsToAdd = imgData.data
    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] += pixelsToAdd[i]
      this.pixels[i + 1] += pixelsToAdd[i + 1]
      this.pixels[i + 2] += pixelsToAdd[i + 2]
    }
  }

  /**
   * Harris corner detection impl (not working yet...)
   *
   * @param {int} windowSize window corner search size
   * @param {float} threshold corner threshold
   */
  harrisCorner(windowSize, threshold) {
    //calc derivatives v
    //setup harris matrix
    //calc eigenwaarden
    //process eigenwaarden en bepaal punten?

    let m = this.normalizeMatrix(this.matrix)

    //horizontal and vertical sobel kernels
    let kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
    let ky = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]

    console.log('calc sobel')

    let ix = this.sobel(m, kx)
    let iy = this.sobel(m, ky)

    //this.matrix = ix;

    let points = []

    //calc window scores
    for (let j = 0; j < this.getHeight(); j += windowSize) {
      for (let i = 0; i < this.getWidth(); i += windowSize) {
        let score = this.calcWindow(m, i, j, windowSize, ix, iy)
        console.log(score)

        if (score >= threshold) {
          points.push([
            i + Math.round(windowSize / 2),
            j + Math.round(windowSize / 2)
          ])
        }
      }
    }

    console.log('aantal cornerns: ' + points.length)

    /* for (let i = 0; i < points.length; i++) {
      let pos = points[i];

      this.drawPoint(pos[0], pos[1], 6);

  } */

    /* this.matrix = this.sobel(m, kx);

  console.log(this.matrix); */

    /* let p = math.matrix(this.matrix);
  console.log(math.print("show result: $mat", {mat: p})); */
  }

  // op dit moment met een cte window function, maybe eens met een gaussian matrix eens proberen?
  calcWindow(mat, x, y, size, intensx, intensy) {
    this.matrix = intensx

    let ix = 0
    let iy = 0
    for (let j = y; j < size; j++) {
      for (let i = x; i < size; i++) {
        if (j >= 0 && j < mat.length && i >= 0 && i < mat[0].length) {
          ix += intensx[j][i]
          console.log(intensx[j][i])
          iy += intensy[j][i]
        }
      }
    }

    //console.log(ix);

    let m = Math.matrix([[ix * ix, ix * iy], [ix * iy, iy * iy]])

    let det = Math.det(m)
    let trace = Math.trace(m)
    let k = 0.04 //tussen 0.04 en 0.06

    let score = det - k * (trace * trace)

    return score
  }

  sobel(mat, kernel) {
    // new clean matrix
    let result = new Array(mat.length)

    for (let i = 0; i < result.length; i++) {
      result[i] = new Array(mat[0].length)
    }

    for (let j = 0; j < this.getHeight(); j++) {
      for (let i = 0; i < this.getWidth(); i++) {
        let val = this.convolution(mat, kernel, i, j)

        if (val > 2) {
          // handpicked threshold, max value is 4
          result[j][i] = 1
        } else {
          result[j][i] = 0
        }
      }
    }

    return result
  }

  //img convolution voor 3x3 kernel matrix
  convolution(mat, kernel, x, y) {
    let result = 0

    for (let u = 0; u < 3; u++) {
      for (let v = 0; v < 3; v++) {
        let j = u + (y - 1)
        let i = v + (x - 1)

        if (j >= 0 && j < this.getHeight() && i >= 0 && i < this.getWidth()) {
          result += kernel[u][v] * mat[j][i]

          if (result < 0) {
            //console.log("kleiner dan nul --> " + Math.abs(result));
          }
        }
      }
    }

    return Math.abs(result)
  }

  //nu om terug een cleane binaire img te krijgen (ipv met ids er bij in)
  normalizeMatrix(mat) {
    let result = mat

    for (let j = 0; j < mat.length; j++) {
      for (let i = 0; i < mat.length; i++) {
        if (mat[j][i] > 0) {
          mat[j][i] = 1
        }
      }
    }

    return result
  }

  //binaire img naar bw hsl matrix
  matrixToImg() {
    for (let i = 0; i < this.pixels.length; i += 4) {
      this.pixels[i] = 0
      this.pixels[i + 1] = 0

      let pos = this.positionToPixel(i)
      this.pixels[i + 2] = this.matrix[pos[1]][pos[0]] * 255
    }
  }

  medianBlur(ksize) {
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        let LArray = []

        let halfKsize = Math.floor(ksize / 2)
        for (let yBox = -halfKsize; yBox <= halfKsize; yBox++) {
          for (let xBox = -halfKsize; xBox <= halfKsize; xBox++) {
            let pixel = this.getPixel(x + xBox, y + yBox)
            LArray.push(pixel[2])
          }
        }
        LArray.sort(function(a, b) {
          return a - b
        })

        let i = this.pixelToPosition([x, y])
        let half = Math.floor(LArray.length / 2)
        this.pixels[i + 2] = LArray[half]
      }
    }
  }

  medianBlurMatrix(kSize) {
    let halfKSize = Math.floor(kSize / 2)
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        let LArray = []

        for (let yBox = -halfKSize; yBox <= halfKSize; yBox++) {
          for (let xBox = -halfKSize; xBox <= halfKSize; xBox++) {
            if (
              y + yBox >= 0 &&
              y + yBox < this.getHeight() &&
              x + xBox >= 0 &&
              x + xBox < this.getWidth()
            ) {
              let pixel = this.matrix[y + yBox][x + xBox]
              LArray.push(pixel)
            }
          }
          LArray.sort(function(a, b) {
            return a - b
          })
          let half = Math.floor(LArray.length / 2)
          this.matrix[y][x] = LArray[half]
        }
      }
    }
  }

  cornerDetection() {
    let nbNeigbours = 2
    let corners = []
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        let white = 0
        let black = 0
        if (this.getPixel(x, y)[2] === 100) {
          for (let yBox = -nbNeigbours; yBox <= nbNeigbours; yBox++) {
            for (let xBox = -nbNeigbours; xBox <= nbNeigbours; xBox++) {
              let pixel = this.getPixel(x + xBox, y + yBox)
              if (pixel[2] === 100) {
                white += 1
              } else if (pixel[2] === 0) {
                black += 1
              }
            }
          }
          if (white >= 7 && white <= 12 && black >= 13 && black <= 18) {
            let i = this.pixelToPosition([x, y])
            corners.push([x, y])
          }
        }
      }
    }
    this.corners = this.cornerFilter(corners)
  }

  cornerFilter(corners) {
    let newCorners = []
    corners.sort(function(a, b) {
      if (a[0] === b[0]) return a[1] - b[1]
      return a[0] - b[0]
    })
    for (let i = 0; i < corners.length - 1; i++) {
      if (corners[i + 1][0] - corners[i][0] <= 10) {
        if (corners[i + 1][1] - corners[i][1] <= 10) {
          let newX = (corners[i][0] + corners[i + 1][0]) / 2
          let newY = (corners[i][1] + corners[i + 1][1]) / 2
          newCorners.push([newX, newY])
          corners[i + 1] = [newX, newY]
        }
      }
    }
    return newCorners
  }

  getPixel(xPixel, yPixel) {
    if (xPixel < 0) {
      xPixel = 0
    } else if (xPixel >= this.getWidth()) {
      xPixel = this.getWidth() - 1
    }

    if (yPixel < 0) {
      yPixel = 0
    } else if (yPixel >= this.getHeight()) {
      yPixel = this.getHeight() - 1
    }
    let i = (yPixel * this.getWidth() + xPixel) * 4
    return [this.pixels[i], this.pixels[i + 1], this.pixels[i + 2]]
  }

  createGreenBlueMask() {
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
      if (this.inGreenRange(H, S, L)) {
        this.pixels[i + 1] = 0
        this.pixels[i + 2] = 100
        this.matrix[y][x] = 1
      } else if (this.inBlueRange(H, S, L)) {
        this.pixels[i + 1] = 0
        this.pixels[i + 2] = 100
        this.matrix[y][x] = 2
      } else {
        this.pixels[i + 1] = 0
        this.pixels[i + 2] = 0
        this.matrix[y][x] = 0
      }
    }
  }

  inGreenRange(H, S, L) {
    return (
      H >= this.lowerBoundG[0] &&
      S >= this.lowerBoundG[1] &&
      L >= this.lowerBoundG[2] &&
      H <= this.upperBoundG[0] &&
      S <= this.upperBoundG[1] &&
      L <= this.upperBoundG[2]
    )
  }

  inBlueRange(H, S, L) {
    return (
      H >= this.lowerBoundB[0] &&
      S >= this.lowerBoundB[1] &&
      L >= this.lowerBoundB[2] &&
      H <= this.upperBoundB[0] &&
      S <= this.upperBoundB[1] &&
      L <= this.upperBoundB[2]
    )
  }

  positionToPixel(position) {
    position /= 4
    let x = position % this.getWidth()
    let y = (position - x) / this.getWidth()
    return [x, y]
  }

  pixelToPosition(pixel) {
    return (pixel[1] * this.getWidth() + pixel[0]) * 4
  }

  makeRed(position) {
    if (this.getColorSpace() === 'RGBA') {
      this.pixels[position] = 255
      this.pixels[++position] = 0
      this.pixels[++position] = 0
    } else if (this.getColorSpace() === 'HSLA') {
      this.pixels[position] = 0
      this.pixels[++position] = 100
      this.pixels[++position] = 50
    }
  }

  /**
   * DEBUG METHODS
   */

  /**
   * Draw a cross at the given pixel location of the given pixel size
   * @param {int} x x co
   * @param {int} y y co
   * @param {int} size size
   */
  drawPoint(x, y, size) {
    if (this.getColorSpace() === 'HSLA') {
      this.hslaToRgba()
      var change = true
    }

    size = Math.round(size)

    //verticale lijn
    for (let j = y - size / 2; j <= y + size / 2; j++) {
      let pos = this.pixelToPosition([x, j])

      this.pixels[pos] = 255
      this.pixels[pos + 1] = 255
      this.pixels[pos + 2] = 0
    }

    //horizontale lijn
    for (let i = x - size / 2; i <= x + size / 2; i++) {
      let pos = this.pixelToPosition([i, y])

      this.pixels[pos] = 255
      this.pixels[pos + 1] = 255
      this.pixels[pos + 2] = 0
    }
    if (change) {
      this.rgbaToHsla()
    }
  }

  /**
   * Draw a filled rectangle on top of the image
   *
   * @param {Array} startCorner linkerbovenhoek vector co array
   * @param {Array} endCorner rechteronderhoek vector co array
   * @param {number} alpha getal 0..1
   */
  drawFillRect(startCorner, endCorner, alpha) {
    let change = true
    if (this.getColorSpace() == 'HSLA') {
      this.hslaToRgba()
      change = true
    }
    alpha = alpha * 255

    for (let j = startCorner[1]; j <= endCorner[1]; j++) {
      for (let i = startCorner[0]; i <= endCorner[0]; i++) {
        let pos = this.pixelToPosition([i, j])

        this.pixels[pos] = Math.min(this.pixels[pos] + alpha, 255)
        this.pixels[pos + 1] = 0
        this.pixels[pos + 2] = 0
      }
    }
    if (change) {
      this.rgbaToHsla()
    }
  }
}
