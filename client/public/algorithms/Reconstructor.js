class Reconstructor {
  constructor(midPoint, matrix, id, width, height) {
    this.midPoint = midPoint
    this.matrix = matrix
    this.id = id
    this.width = width
    this.height = height
    this.yellow = id
    this.pink = id + 1
    this.radius = null //is set later
  }

  /**
   * Uses array of known corners to reconstruct unknown corners using line intersection.
   * 2 lines are used: from known corner to helpPoint (using reconstructCircle) and from midpoint to helpMid
   * Array of corners should be properly sorted before calling function. (LU, RU, RD, LD)
   * @returns {Array.<Array>} corners, array of array.
   */
  reconstructCorners(corners) {
    let newCorners = { ...corners }

    let helpMids = this.reconstructCircleMidPoint(this.midPoint)
    helpMids = this.orderCorners(helpMids)
    helpMids = this.fixMids(helpMids)

    let helpMid = null
    let helpPoint = null
    let helpCorner = null
    let otherCorner = null
    let helpPoints = null

    //missing LU
    if (corners.LU === null) {
      if (helpMids.LU !== null) helpMid = helpMids.LU
      else helpMid = helpMids.RD
      if (corners.RU !== null) {
        helpPoints = this.reconstructCircle(corners.RU)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.RU
          otherCorner = corners.RD
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      } else if (this.corners.LD !== null) {
        helpPoints = this.reconstructCircle(corners.LD)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.LD
          otherCorner = corners.RD
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      }

      let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid)
      this.addColorId(corner, corners.RD)
      newCorners.LU = corner
    }
    //missing RU
    if (corners.RU === null) {
      if (helpMids.RU !== null) helpMid = helpMids.RU
      else helpMid = helpMids.LD
      if (corners.LU !== null) {
        helpPoints = this.reconstructCircle(corners.LU)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.LU
          otherCorner = corners.LD
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      } else if (corners.RD !== null) {
        helpPoints = this.reconstructCircle(corners.RD)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.RD
          otherCorner = corners.LD
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      }

      let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid)
      this.addColorId(corner, corners.LD)
      newCorners.RU = corner
    }
    //missing RD
    if (corners.RD === null) {
      if (helpMids.RD !== null) helpMid = helpMids.RD
      else helpMid = helpMids.LU
      if (corners.RU !== null) {
        helpPoints = this.reconstructCircle(corners.RU)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.RU
          otherCorner = corners.LU
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      } else if (corners.LD !== null) {
        helpPoints = this.reconstructCircle(corners.LD)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.LD
          otherCorner = corners.LU
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      }

      let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid)
      this.addColorId(corner, corners.LU)
      newCorners.RD = corner
    }
    //missing LD
    if (corners.LD === null) {
      if (helpMids.LD !== null) helpMid = helpMids.LD
      else helpMid = helpMids.RU
      if (corners.RD !== null) {
        helpPoints = this.reconstructCircle(corners.RD)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.RD
          otherCorner = corners.RU
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      } else if (corners.LU !== null) {
        helpPoints = this.reconstructCircle(corners.LU)
        if (helpPoints.length >= 3) {
          helpPoints = helpPoints.slice(0, 2)
          helpCorner = corners.LU
          otherCorner = corners.RU
          helpPoint = this.findHelpPoint(helpPoints, helpCorner, otherCorner)
        }
      }

      let corner = this.reconstructCorner(helpPoint, helpCorner, helpMid)
      this.addColorId(corner, corners.RU)
      newCorners.LD = corner
    }

    return newCorners
  }

  fixMids(helpMids) {
    let points = Object.values(helpMids)
    for (let i = 0; i < points.length; i++) {
      let point = points[i]
      if (point === null || point === undefined) {
        //Plaats overstaand punt ipv null
        points[i] = points[(i + 2) % 4]
      }
    }
    return {
      LU: points[0],
      RU: points[1],
      RD: points[2],
      LD: points[3]
    }
<<<<<<< HEAD:client/src/algorithms/Reconstructor.js

=======
>>>>>>> makeitthreaded:client/public/algorithms/Reconstructor.js
  }

  /**
   * Intersects 2 lines to reconstruct missing corner from known corners and help/midPoints
   * @param {Array} helpPoint points around known corners along edges
   * @param {Array} helpCorner known corner
   * @param {Array.<Array>} helpMid points around midPoint along diagonal lines
   * @return {Array} missingCorner, array with coordinates
   */
  reconstructCorner(helpPoint, helpCorner, helpMid) {
    let helpLine1 = new Line(helpPoint, helpCorner)
    let helpLine2 = new Line(this.midPoint, helpMid)
    let missingCorner = helpLine1.calcIntersection(
      helpLine2,
      this.width,
      this.height
    )

    return missingCorner
  }

  addColorId(point, oppositePoint) {
    point.push(oppositePoint[2] === this.yellow ? this.pink : this.yellow)
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

      return RD[2] === this.pink && LD[2] === this.pink
    } else if (LU === null) {
      let RD = pointList[2]

      if (RD !== null) {
        return RU[2] === this.yellow && RD[2] === this.pink
      } else {
        let LD = pointList[3]

        return RU[2] === this.yellow && LD[2] === this.pink
      }
    } else if (RU === null) {
      let RD = pointList[2]

      if (RD !== null) {
        return LU[2] === this.yellow && RD[2] === this.pink
      } else {
        let LD = pointList[3]

        return LU[2] === this.yellow && LD[2] === this.pink
      }
    } else {
      return LU[2] === this.yellow && RU[2] === this.yellow
    }
  }

  /**
   * Orders points (usually corners)
   * @param {Array.<Array>} pointList array of arrays containing points to be sorted
   * @returns {RD: Array, RU: Array, LD: Array, LU: Array} containing properly sorted points as arrays with coordinates
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
   * Finds correct helpPoint to use to get correct intersection for missing corners
   * @param {Array.<Array>} helpPoints array of array containing helpPoints of helpCorner
   * @param {Array} helpCorner
   * @param {Array} otherCorner
   * @returns {Array} result, array, correct helpPoint coordinates
   */
  findHelpPoint(helpPoints, helpCorner, otherCorner) {
    let knownLine = new Line(helpCorner, otherCorner)

    let result = helpPoints[0]
    let angle = 0

    for (let i = 0; i < helpPoints.length; i++) {
      const hp = helpPoints[i]

      let line = new Line(helpCorner, hp)

      let a = Math.abs(line.angle - knownLine.angle)

      if (a > angle) {
        angle = a
        result = hp
      }
    }

    return result
  }

  /**
   * Calculates the 2 points (later called helpPoints) around a corner that lie along the edges of the screen.
   * Later used for corner reconstruction.
   * @param {Array} cornerCoo Coordinate of the corner
   * @param {Array.<Array>} matrix screenmatrix (B&W)
   * @param {Int} id screen id
   * @param {Int} radius radius of search circle
   * @returns {Array.<Array>} reco, containing 4 coordinate arrays
   */
  //https://stackoverflow.com/questions/53432767/how-to-iterate-over-pixels-on-edge-of-a-square-in-1-iteration
  reconstructCircle(cornerCoo) {
    let lines = this.calcLinesCirc(cornerCoo)
    let reco = []
    let furthestPoints = this.calcTwoFurthestPoints(lines)
    let validatedFurthestPoints = this.validateTwoFurthestPoints(
      cornerCoo,
      furthestPoints,
      lines
    )
    validatedFurthestPoints.forEach(point => reco.push(point))

    let biggest
    let biggestNb = -Infinity
    for (let i = 0; i < lines.length; i++) {
      if (
        !lines[i].includes(furthestPoints[0]) &&
        !lines[i].includes(furthestPoints[1])
      ) {
        if (biggestNb < lines[i].length) {
          biggest = lines[i]
          biggestNb = lines[i].length
        }
      }
    }
    if (biggest != null) {
      reco.push(biggest[Math.floor(biggest.length / 2)])
    }

    return reco
  }

  /**
   * Calculates midPoints around the middle point. These midPoints lie on the diagonal lines of the screen
   * and are used to make lines to potential unknown corners for reconstruction.
   * @param midPointCoo, array containing midPoint coordinates
   * @param {Array} matrix data matrix
   * @param {Int} id screen id
   * @param {Int} radius radius of search circle
   * @returns {Array.<Array>} reco, array of arrays
   */
  reconstructCircleMidPoint(midPointCoo) {
    let lines = this.calcLinesCirc(midPointCoo)

    while (lines.length > 4) {
      let lengths = []
      for (let i = 0; i < lines.length; i++) {
        lengths.push(lines[i].length)
      }

      let minLength = Math.min(...lengths)
      let index = lengths.indexOf(minLength)
      lines.splice(index, 1)
    }

    let reco = []
    for (let i = 0; i < lines.length; i++) {
      let midPoint = lines[i][Math.floor(lines[i].length / 2)]
      if (!this.crossesWhite(midPointCoo, midPoint)) {
        reco.push(midPoint)
      } else {
        reco.push(null)
      }
    }

    return reco
  }

  /**
   * Calculates all lines "radius far" around point in yellow or pink region
   * @param {Array} cornerCoo array containing corner coordinates
   * @param {Array} matrix data matrix
   * @param {Int} id screen id
   * @param {Int} radius radius of search circle
   * @returns {Array.<Array>} lines,
   */
  calcLinesCirc(cornerCoo) {
    const dTheta = 0.01
    const maxWrongPixel = 5

    let white = false
    let lines = []
    let newLine = []
    let blackCount = 0

    // Calculate start theta
    let startTheta = 0
    let x = cornerCoo[0] + Math.floor(this.radius * Math.cos(startTheta))
    let y = cornerCoo[1] + Math.floor(this.radius * Math.sin(startTheta))
    while (this.isFromIsland(x, y)) {
      startTheta += dTheta
      x = cornerCoo[0] + Math.floor(this.radius * Math.cos(startTheta))
      y = cornerCoo[1] + Math.floor(this.radius * Math.sin(startTheta))
    }

    for (
      let theta = startTheta;
      theta < startTheta + 2 * Math.PI;
      theta += dTheta
    ) {
      let x = cornerCoo[0] + Math.floor(this.radius * Math.cos(theta))
      let y = cornerCoo[1] + Math.floor(this.radius * Math.sin(theta))

      if (newLine[newLine.length - 1] !== [x, y]) {
        if (this.isFromIsland(x, y)) {
          white = true
          blackCount = 0
          newLine.push([x, y, this.getMatrix(x, y)])
        } else if (white && ++blackCount >= maxWrongPixel) {
          blackCount = 0
          white = false
          lines.push(newLine.slice(0))
          newLine.length = 0
        }
      }
    }
    if (newLine.length > 0) {
      lines.push(newLine.slice(0))
    }
    return lines
  }

  /**
   * Takes lines list and determines the 2 lines that lie furthest from each other.
   * Note: "lines" are just points going to corner.
   * @param {Array.<Array>} lines
   * @returns {[]|Array}
   */
  calcTwoFurthestPoints(lines) {
    if (lines.length < 2) {
      return []
    }

    let points = []
    for (let i = 0; i < lines.length; i++) {
      points.push(lines[i][0])
      points.push(lines[i][lines[i].length - 1])
    }
    let furthestDist = 0
    let furthestPoints = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        let point1 = points[i]
        let point2 = points[j]
        let dist = Algebra.calcDist(point1, point2)
        if (dist > furthestDist) {
          furthestPoints = [point1, point2, dist]
          furthestDist = dist
        }
      }
    }
    return furthestPoints
  }

  validateTwoFurthestPoints(cornerCoo, points, lines) {
    if (!isFinite(points[2])) {
      return []
    }

    let point1 = points[0]
    let point2 = points[1]
    let line1
    let line2

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(point1)) {
        if (lines[i][0] === point1) {
          line1 = lines[i]
        } else line1 = lines[i].reverse()
      }
    }
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(point2)) {
        if (lines[i][0] === point2) {
          line2 = lines[i]
        } else line2 = lines[i].reverse()
      }
    }

    let validatedPoints = []
    for (let i = 0; i < line1.length; i++) {
      point1 = line1[i]
      if (!this.crossesWhite(cornerCoo, point1)) {
        validatedPoints.push(line1[i])
        break
      }
    }
    for (let i = 0; i < line2.length; i++) {
      point2 = line2[i]
      if (!this.crossesWhite(cornerCoo, point2)) {
        validatedPoints.push(line2[i])
        break
      }
    }
    return validatedPoints
  }

  crossesWhite(cornerCoo, point) {
    let point1 = cornerCoo
    let point2 = point

    if (point2[0] <= point1[0]) {
      ;[point1, point2] = [point2, point1]
    }

    let a = (point2[1] - point1[1]) / (point2[0] - point1[0])
    let b = point1[1] - a * point1[0]

    if (isFinite(a)) {
      for (let x = point1[0]; x <= point2[0]; x++) {
        let y = Math.round(a * x + b)
        let id = this.getMatrix(x, y)
        if (id === 0) {
          return true
        }
      }
    } else {
      if (point2[1] < point1[1]) {
        ;[point1, point2] = [point2, point1]
      }
      let x = point1[0]
      for (let y = point1[1]; y <= point2[1]; y++) {
        let id = this.getMatrix(x, y)
        if (id === 0) {
          return true
        }
      }
    }

    return false
  }

  setRadius(radius) {
    this.radius = radius
  }

  isFromIsland(x, y) {
    let pixel = this.getMatrix(x, y)
    return pixel >= this.id && pixel <= this.id + 2
  }

  getMatrix(x, y) {
    if (x < 0 || x >= this.matrix[0].length) return 0
    if (y < 0 || y >= this.matrix.length) return 0
    return this.matrix[y][x]
  }
}
