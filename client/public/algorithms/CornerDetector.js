class CornerDetector {
  constructor(screenMatrix, midPoint, id) {
    this.matrix = screenMatrix
    this.midPoint = midPoint
    this.id = id
    this.corners = {
      LU: null,
      RU: null,
      RD: null,
      LD: null
    }
    this.height = this.matrix.length
    this.width = this.matrix[0].length
    this.reconstructor = new Reconstructor(
      this.midPoint,
      this.matrix,
      this.id,
      this.width,
      this.height
    )
    this.radiusFactor = 1/4
    this.radius = null //will be set later
    this.blue = id
    this.green = id + 1
  }

  /**
   * Detects all correct corners. If some are covered, the algorithm will use reconstruction methods to find them.
   * In case of covering, tmpCorners will contain correct and incorrect corners. The latter will be replaced with
   * reconstruction corners.
   * @returns {Array.<Array>} corners, array of arrays.
   */
  cornerDetection() {
    let tmpCorners = this.findCorners()
    this.radius = this.calcRadius(this.radiusFactor, tmpCorners)
    this.reconstructor.setRadius(this.radius)
    //returns 4 corners in relative position
    let nonPositionCorners = this.validateCorners(tmpCorners)
    if (
      nonPositionCorners.filter(function(point) {
        return point != null
      }).length < 2
    ){
      throw 'Not enough good corners detected for reconstruction'
    }


    this.corners = this.orderCorners(nonPositionCorners)
    nonPositionCorners = nonPositionCorners.filter(function(point) {
      return point != null
    })
    if (nonPositionCorners.length < 4) {
      self.postMessage({text: 'MESSAGE', msg: 'Found ' + nonPositionCorners.length +' corners, reconstructing missing corners' })
      let corners = this.corners
      this.corners = this.reconstructor.reconstructCorners(corners)
    }
    return this.corners
  }

  /**
   * Checks whether points are properly sorted.
   * @param {Array.<Array>} pointList array of arrays
   * @returns {boolean}
   */
  isValidOrder(pointList) {
    let LU = pointList[0]
    let RU = pointList[1]

    if (LU === null && RU === null) {
      let RD = pointList[2]
      let LD = pointList[3]

      return RD[2] === this.green && LD[2] === this.green
    } else if (LU === null) {
      let RD = pointList[2]

      if (RD !== null) {
        return RU[2] === this.blue && RD[2] === this.green
      } else {
        let LD = pointList[3]

        return RU[2] === this.blue && LD[2] === this.green
      }
    } else if (RU === null) {
      let RD = pointList[2]

      if (RD !== null) {
        return LU[2] === this.blue && RD[2] === this.green
      } else {
        let LD = pointList[3]

        return LU[2] === this.blue && LD[2] === this.green
      }
    } else {
      return LU[2] === this.blue && RU[2] === this.blue
    }
  }

  /**
   * Orders points (usually corners)
   * @param {Array.<Array>} pointList array of arrays containing points to be sorted
   * @returns dictionary, containing properly sorted points as arrays with coordinates
   */
  orderCorners(pointList) {
    for (let i = 0; i < pointList.length; i++) {
      if (this.isValidOrder(pointList)) {
        break
      }
      pointList.push(pointList.shift())
    }

    return {
      LU: pointList[0],
      RU: pointList[1],
      RD: pointList[2],
      LD: pointList[3]
    }
  }

  /**
   * Detects all corners of island. May not be correct corners if covered.
   * @returns {Array.<Array>} corners, array of arrays.
   */
  findCorners() {
    // choosing diagonal or straight corner detection
    let diagonalSearch = false

    // Find which corner search to use: perpendicular or diagonal.

    const ratio = 0.07
    const minPixels = 10
    const sd_threshold = 0.15

    const testOffsetX = Math.max(Math.floor(ratio * this.width), minPixels)
    //const testOffsetY = Math.max(Math.floor(ratio * this.height), minPixels)

    // Left variance
    let yValuesLeft = []
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < testOffsetX; x++) {
        if (this.isFromIsland(x, y)) yValuesLeft.push(y / this.height)
      }
    }
    let yValuesLeftAvg =
      yValuesLeft.reduce((t, n) => t + n) / yValuesLeft.length

    let yValuesLeftVariance = Math.sqrt(
      yValuesLeft.reduce((t, n) => t + Math.pow(yValuesLeftAvg - n, 2)) /
        yValuesLeft.length
    )

    if (yValuesLeftVariance > sd_threshold) diagonalSearch = true

    let corners = []
    if (diagonalSearch) {
      console.log('diagonal search')
      // Diagonal search
      corners = this.diagonalSearch()
    } else {
      console.log('perpendicular search')
      // Perpendicular search
      corners = this.perpendicularSearch()
    }

    return corners
  }

  /**
   * Will scan for corners along diagonal lines. Used if screen is horizontal or vertical (perpendicularSearch()
   * will not work here)
   * @returns {Array.<Array>} corners, array of arrays.
   */
  diagonalSearch() {
    let corners = []
    // left upper corner
    for (let k = 0; k <= this.width + this.height - 2; k++) {
      let found = false
      for (let j = 0; j <= k; j++) {
        let i = k - j
        if (i < this.height && j < this.width && this.isFromIsland(j, i)) {
          corners.push([j, i, this.matrix[i][j]])
          found = true
          break
        }
      }
      if (found) break
    }

    // right upper corner
    for (let k = 0; k <= this.width + this.height - 2; k++) {
      let found = false
      for (let j = 0; j <= k; j++) {
        let i = k - j
        if (
          i < this.height &&
          j < this.width &&
          this.isFromIsland(this.width - j - 1, i)
        ) {
          corners.push([
            this.width - j - 1,
            i,
            this.matrix[i][this.width - j - 1]
          ])
          found = true
          break
        }
      }
      if (found) break
    }

    // right lower corner
    for (let k = 0; k <= this.width + this.height - 2; k++) {
      let found = false
      for (let j = 0; j <= k; j++) {
        let i = k - j
        if (
          i < this.height &&
          j < this.width &&
          this.isFromIsland(this.width - j - 1, this.height - i - 1)
        ) {
          corners.push([
            this.width - j - 1,
            this.height - i - 1,
            this.matrix[this.height - i - 1][this.width - j - 1]
          ])
          found = true
          break
        }
      }
      if (found) break
    }

    // left lower corner
    for (let k = 0; k <= this.width + this.height - 2; k++) {
      let found = false
      for (let j = 0; j <= k; j++) {
        let i = k - j
        if (
          i < this.height &&
          j < this.width &&
          this.isFromIsland(j, this.height - i - 1)
        ) {
          corners.push([
            j,
            this.height - i - 1,
            this.matrix[this.height - i - 1][j]
          ])
          found = true
          break
        }
      }
      if (found) break
    }
    return corners
  }

  /**
   * Will scan for corners along vertical and horizontal lines. Used if screen is tilted.
   * @returns {Array.<Array>} corners, array of arrays.
   */
  perpendicularSearch() {
    let corners = []
    // left
    for (let x = 0; x < this.width; x++) {
      let found = false
      let tempY = []
      for (let y = 0; y < this.height; y++) {
        if (this.isFromIsland(x, y)) {
          tempY.push(y)
          found = true
        }
      }
      if (found) {
        let medianY = tempY[Math.floor(tempY.length / 2)]
        corners.push([x, medianY, this.matrix[medianY][x]])
        break
      }
    }

    // top
    for (let y = 0; y < this.height; y++) {
      let found = false
      let tempX = []
      for (let x = 0; x < this.width; x++) {
        if (this.isFromIsland(x, y)) {
          tempX.push(x)
          found = true
        }
      }
      if (found) {
        let medianX = tempX[Math.floor(tempX.length / 2)]
        corners.push([medianX, y, this.matrix[y][medianX]])
        break
      }
    }

    // right
    for (let x = 0; x < this.width; x++) {
      let found = false
      let tempY = []
      for (let y = 0; y < this.height; y++) {
        if (this.isFromIsland(this.width - x - 1, y)) {
          tempY.push(y)
          found = true
        }
      }
      if (found) {
        let medianY = tempY[Math.floor(tempY.length / 2)]
        corners.push([
          this.width - x - 1,
          medianY,
          this.matrix[medianY][this.width - x - 1]
        ])
        break
      }
    }
    // bottom
    for (let y = 0; y < this.height; y++) {
      let found = false
      let tempX = []
      for (let x = 0; x < this.width; x++) {
        if (this.isFromIsland(x, this.height - y - 1)) {
          tempX.push(x)
          found = true
        }
      }
      if (found) {
        let medianX = tempX[Math.floor(tempX.length / 2)]
        corners.push([
          medianX,
          this.height - y - 1,
          this.matrix[this.height - y - 1][medianX]
        ])
        break
      }
    }
    return corners
  }

  validateCorners(tmpCorners) {
    let distances = []
    for (let i = 0; i < tmpCorners.length; i++) {
      let c1 = tmpCorners[i]
      let c2 = tmpCorners[(i + 1) % tmpCorners.length]

      let distance = Math.sqrt(
        Math.pow(c2[0] - c1[0], 2) + Math.pow(c2[1] - c1[1], 2)
      )
      distances.push(distance)
    }

    let minDistance = Math.min(...distances)
    let maxDistance = Math.max(...distances)

    if (minDistance / maxDistance < 0.05) {
      let i1 = distances.indexOf(minDistance)
      let i2 = (i1 + 1) % tmpCorners.length

      let c1, c2
      if (i1 < tmpCorners.length - 1) {
        c1 = tmpCorners[i1]
        c2 = tmpCorners[i2]
      } else {
        c1 = tmpCorners[i1]
        c2 = tmpCorners[i2]
      }

      let mid = [
        Math.round((c1[0] + c2[0]) / 2),
        Math.round((c1[1] + c2[1]) / 2),
        c1[2]
      ]

      let nextC = tmpCorners[(i2 + 1) % tmpCorners.length]
      let newDistance = Math.sqrt(
        Math.pow(nextC[0] - mid[0], 2) + Math.pow(nextC[1] - mid[1], 2)
      )

      if (newDistance > maxDistance) {
        tmpCorners[i1] = mid
        tmpCorners[i2] = null
      } else {
        tmpCorners[i1] = mid
        tmpCorners[i2] = null
      }
    }

    let validCorners = []
    for (let c = 0; c < tmpCorners.length; c++) {
      let tmpCorner = tmpCorners[c]
      if (
        this.reconstructor.reconstructCircle([tmpCorner[0], tmpCorner[1]])
          .length >= 3
      ) {
        validCorners.push(tmpCorner)
      } else validCorners.push(null)
    }

    return validCorners
  }

  isFromIsland(x, y) {
    let pixel = this.getMatrix(x, y)
    return pixel >= this.id && pixel <= this.id + 2
  }

  //calculates it based on the point with the longest distance from the temporary corners to the midpoint.
  calcRadius(factor, corners) {
    let distance = this.farestToMid(corners)
    return Math.floor(distance * factor)
  }

  farestToMid(corners) {
    let points = Object.values(corners)
    let distances = []
    for (let i = 0; i < 4; i++) {
      if (points[i] !== null) {
        distances.push(Algebra.calcDist(points[i], this.midPoint))
      } else distances.push(null)
    }
    return Math.max(...distances)
  }

  getMatrix(x, y) {
    if (x < 0 || x >= this.matrix[0].length) return 0
    if (y < 0 || y >= this.matrix.length) return 0
    return this.matrix[y][x]
  }

}
