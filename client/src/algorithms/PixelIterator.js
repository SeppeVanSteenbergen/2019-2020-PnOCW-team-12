export default class PixelIterator {
  constructor(point1, point2, width, height) {
    if (point1[0] < point2[0]) {
      this.reverted = false
      this.leftPoint = point1
      this.rightPoint = point2
    } else {
      this.reverted = true
      this.leftPoint = point2
      this.rightPoint = point1
    }

    this.terminated = false

    this.width = width
    this.height = height

    this.m =
      (this.rightPoint[1] - this.leftPoint[1]) /
      (this.rightPoint[0] - this.leftPoint[0])

    if (this.m < 0) {
      this.mode = 1
    } else {
      this.mode = 0
    }
    this.left = true
    this.y = height - 1
    this.x = 0
    this.xoffset = 0
  }

  next() {
    if (this.terminated) throw 'The iterator has been terminated'
    if (this.y === 0) {
      this.y--
      this.left = false
      this.x = 0
      this.xoffset = 0
    }
    if (this.xoffset >= this.width) {
      this.terminated = true
      console.log('terminated')
    }
    if (this.left) {
      let curY = Math.floor(this.y + this.m * this.x++)
      //if (this.mode === 1) curY = this.height - 1 + curY
      if (curY >= 0 && curY < this.height && this.x < this.width) {
        return [
          this.reverted ? this.width - 1 - (this.x - 1) : this.x - 1,
          this.reverted ? this.height - 1 - curY : curY
        ]
      } else {
        this.y--
        this.x = this.xoffset
        return this.next()
      }
    } else {
      let curY = Math.floor(this.m * (this.x++ - this.xoffset))
      if (this.mode === 1) curY = this.height - 1 + curY
      if (curY >= 0 && curY < this.height && this.x < this.width) {
        return [
          this.reverted ? this.width - 1 - (this.x - 1) : this.x - 1,
          this.reverted ? this.height - 1 - curY : curY
        ]
      } else {
        this.xoffset++
        this.x = this.xoffset
        return this.next()
      }
    }
  }
}
