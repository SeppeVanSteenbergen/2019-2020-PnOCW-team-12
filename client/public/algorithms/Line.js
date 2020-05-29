/**
 * A quality of life helper class for screen reconstruction
 */
/**
 * A quality of life helper class for screen reconstruction
 */
class Line {
  /**
   * Initiate the line trough 2  random points
   *
   * @param {array} a point a
   * @param {array} b point b
   */
  constructor(a, b) {
    if (a === null) {
      console.error('first point of line is null')
    }
    if (b === null) {
      console.error('second point of line is null')
    }

    this._a = a.slice(0, 2)
    this._b = b.slice(0, 2)

    this.dx = b[0] - a[0]
    this.dy = b[1] - a[1]
  }

  get a() {
    return this._a
  }

  get b() {
    return this._b
  }

  /**
   * Get the rico of this line
   */
  get slope() {
    if (this.dy === 0) {
      return 0
    }

    return this.dy / this.dx
  }

  /**
   * Get the original reconstruction points
   */
  get points() {
    return [this._a, this._b]
  }

  /**
   * Get the angle of this line with the x axis in degrees when working with inverted axis
   */
  get angle() {
    let angle = (Math.atan2(-this.dy, this.dx) * 180) / Math.PI
    if (angle < 0) {
      angle += 360
    }

    return Math.round(Math.abs(angle))
  }

  /**
   * Get the angle of this line with the x axis in degrees when working with normal axis
   */
  get normalAngle() {
    let angle = (Math.atan2(this.dy, this.dx) * 180) / Math.PI
    if (angle < 0) {
      angle += 360
    }

    return Math.round(Math.abs(angle))
  }

  /**
   * Get the start and end points to drawSnow the line over the full canvas
   */
  calcInfinitePoints(width, height) {
    let result = []

    let edges = [
      new Line([0, 0], [0, height]),
      new Line([0, 0], [width, 0]),
      new Line([0, height], [width, height]),
      new Line([width, 0], [width, height])
    ]

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]
      let point = this.calcIntersection(edge, width, height)

      if (point != null) {
        result.push(point)
      }
    }

    return result
  }

  /**
   * Get the intersection point between this line and the given line, null if no intersection point
   *
   * intersection math from: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
   *
   * @param line  the line with which we want to calculate the intersection
   * @param {int} width canvas width (optional)
   * @param {int} height canvas height (optional)
   */
  calcIntersection(line, width, height) {
    let intersection = null

    //calc intersection
    if (this.slope !== line.slope) {
      let x1 = this._a[0]
      let x2 = this._b[0]
      let x3 = line.a[0]
      let x4 = line.b[0]
      let y1 = this._a[1]
      let y2 = this._b[1]
      let y3 = line.a[1]
      let y4 = line.b[1]

      let x =
          ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
          ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
      let y =
          ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
          ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))

      intersection = [Math.floor(x), Math.floor(y)]
    }
    //TODO other checker for intersection because local vs world coordinates!!!

    return intersection
  }

  /**
   * Math floor this result to get the y pixel index
   *
   * @param {float} x get the y value of this line equation
   */
  evaluate(x) {
    let cte = this._a[1] / (this.slope * this._a[0])

    return this.slope * x + cte
  }
}
