class PixelIterator {
  constructor(LU, RU, width, height) {
    this.line = new Line([LU[0], -LU[1]], [RU[0], -RU[1]])
    this.angle = this.line.normalAngle
    this.horizontalMode = this.angle <= 45 || (this.angle >= 135 && this.angle <= 225) || this.angle >= 315
    this.reversed = this.horizontalMode ? this.line.normalAngle > 45 && this.line.normalAngle < 315 : this.line.normalAngle > 135

    this.width = width
    this.height = height

    if (this.horizontalMode) {
      this.b = this.line.slope >= 0 ? 1 : -this.line.slope * (this.width - 1) + 1
      this.x = 0
    } else {
      this.y = -(this.height - 1)
      this.intersectionWidthAxis = this.line.slope >= 0 ? (this.y / this.line.slope) - 1 : -1
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
      this.b = Math.round(this.y - this.line.slope * this.x)

      while (-this.y >= 0) {
        if (this.x >= 0 && this.x < this.width) {
          row.push([this.x, -this.y])
        }
        this.y++
        if (isFinite(this.b)) {
          this.x = Math.round((this.y - this.b) / this.line.slope)
        }
      }

      if (this.intersectionWidthAxis >= this.width - 1 && this.x >= this.width - 1) {
        this.isTerminated = true
      }

      this.y = -(this.height - 1)
    }

    if (this.reversed) {
      row = row.reverse()
    }

    return row
  }
}