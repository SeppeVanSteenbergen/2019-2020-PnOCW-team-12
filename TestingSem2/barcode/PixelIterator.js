class PixelIterator {
  constructor(LU, RU, width, height) {
    this.line = new Line([LU[0], -LU[1]], [RU[0], -RU[1]])

    this.horizontalMode = this.line.normalAngle <= 45 || (this.line.normalAngle >= 135 && this.line.normalAngle <= 225) || this.line.normalAngle >= 315
    this.reversed = this.horizontalMode ? this.line.normalAngle > 45 && this.line.normalAngle < 315 : this.line.normalAngle < 225

    this.width = width
    this.height = height

    if (this.horizontalMode) {
      this.b = 1
      this.x = 0
    } else {
      this.intersectionWidthAxis = -1
      this.y = -(this.height - 1)
    }

    this.isTerminated = false
  }

  hasNextRow() {
    return !this.isTerminated
  }

  nextRow() {
    let row = []
    if (this.horizontalMode) {
      this.b--
      this.y = Math.round(this.line.slope * this.x + this.b)
      console.log(this.b)

      while (this.x < this.width) {
        if (this.y <= 0 && -this.y < this.height) {
          row.push([this.x, -this.y])
        }
        this.x++
        this.y = Math.round(this.line.slope * this.x + this.b)
      }

      this.x--
      this.y = Math.round(this.line.slope * this.x + this.b)
      if (-this.y >= this.height - 1 && -this.b >= this.height - 1) {
        this.isTerminated = true
      }

      this.x = 0
    } else {
      this.intersectionWidthAxis ++
      this.x = this.intersectionWidthAxis
      this.b = Math.round(-this.y - this.line.slope * this.x)
      console.log(this.b)

      while (-this.y >= 0 || this.x >= 0) {
        if (-this.y < this.height && this.x < this.width) {
          row.push([this.x, -this.y])

        }

        this.y++
        this.x = Math.round((this.y - this.b) / this.line.slope)
      }

      this.y = -(this.height - 1)
      this.x = Math.round((this.y - this.b) / this.line.slope)

      if (this.x >= this.width - 1) {
        this.isTerminated = true
      }

      this.y = 0
    }

    if (this.reversed) {
      row = row.reverse()
    }

    return row
  }

  test() {
    while (this.hasNextRow()) {
      console.log(this.nextRow())
    }
  }
}