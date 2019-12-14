import Line from './Line'

export default class Drawer {
  constructor(pixels, width, height, ctx) {
    this.pixels = pixels
    this.width = width
    this.height = height

    this.ctx = ctx

    this.lineQ = []
  }

  getWidth() {
    return this.width
  }

  getHeight() {
    return this.height
  }

  getPixels() {
    return this.pixels
  }

  drawCorners(island) {
    let corners = Object.values(island.corners)
    for (let j = 0; j < corners.length; j++) {
      if (corners[j] !== null) {
        this.drawPoint(corners[j][0], corners[j][1], 10)
      }
    }
  }

  drawMid(island) {
    this.drawPoint(island.midPoint[0], island.midPoint[1], 20)
  }

  /**
   * Drawer a cross at the given pixel location of the given pixel size
   * @param {int} x x co
   * @param {int} y y co
   * @param {int} size size
   */
  drawPoint(x, y, size) {
    x = Math.round(x)
    y = Math.round(y)
    size = Math.round(size)
    let i = x - size / 2

    for (let j = y - size / 2; j <= y + size / 2; j++) {
      let posx = this.pixelToPosition([x, j])
      let posy = this.pixelToPosition([i, y])
      this.makeBlue(posx)
      this.makeBlue(posy)
      i++
    }
  }

  /**
   * Drawer a filled rectangle on top of the image
   *
   * @param {Array} startCorner linkerbovenhoek vector co array
   * @param {Array} endCorner rechteronderhoek vector co array
   */
  drawFillRect(startCorner, endCorner) {
    for (let j = startCorner[1]; j <= endCorner[1]; j++) {
      for (let i = startCorner[0]; i <= endCorner[0]; i++) {
        let pos = this.pixelToPosition([i, j])

        this.makeRed(pos, false)
      }
    }
  }

  /**
   * @note set sat (saturation) to true to make it less visible
   * @param position
   * @param sat
   */
  makeRed(position, sat) {
    this.getPixels()[position] = 30
    if (sat) {
      this.getPixels()[++position] = 10
    } else {
      this.getPixels()[++position] = 100
    }
    this.getPixels()[++position] = 50
    this.getPixels()[++position] = 2
  }

  makeBlue(position) {
    this.getPixels()[position] = 0
    this.getPixels()[++position] = 100
    this.getPixels()[++position] = 50
  }

  pixelToPosition(pixel) {
    return (pixel[1] * this.getWidth() + pixel[0]) * 4
  }

  //TODO: infinite draw
  drawLine(line, infinite = false) {
    if (infinite) {
      let points = line.calcInfinitePoints(this.width, this.height)
      this.lineQ.push(new Line(points[0], points[1]))
    } else {
      this.lineQ.push(line)
    }
  }

  _finishLines() {
    for (let i = 0; i < this.lineQ.length; i++) {
      const line = this.lineQ[i]
      this._contextDrawLine(line)
    }
  }

  _contextDrawLine(line) {
    this.ctx.beginPath()
    this.ctx.strokeStyle = '#FF0000'
    this.ctx.moveTo(line.a[0], line.a[1])
    this.ctx.lineTo(line.b[0], line.b[1])
    this.ctx.stroke()
  }
}
