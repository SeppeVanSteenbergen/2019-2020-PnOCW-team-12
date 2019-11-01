class Island {
  minx;
  maxx;
  miny;
  maxy;
  id;
  screenMatrix = [];
  corners = [];
  blue;
  green;
  width;
  height;

  /**
   * Create and Island starting with this pixel
   * @param {int} x x co
   * @param {int} y y co
   */
  constructor(x, y, id) {
    this.minx = x;
    this.maxx = x;

    this.miny = y;
    this.maxy = y;

    this.id = id;
    this.blue = id + 1;
    this.green = id;
  }

  /**
   * Add a pixel to the Island
   *
   * @param {int} x x co
   * @param {int} y y co
   */
  add(x, y) {
    this.minx = Math.min(x, this.minx);
    this.miny = Math.min(y, this.miny);

    this.maxx = Math.max(x, this.maxx);
    this.maxy = Math.max(y, this.maxy);
  }

  print() {
    console.log('starting co: ' + this.minx + ', ' + this.miny);
    console.log('ending co: ' + this.maxx + ', ' + this.maxy);
  }

  size() {
    return (this.maxx - this.minx) * (this.maxy - this.miny);
  }

  /**
   * Get the square distance from the given pixel position relative to the center of the island
   */
  sqDist(x, y) {
    var cx = (this.maxx - this.minx) / 2;
    var cy = (this.maxy - this.miny) / 2;

    return (cx - x) * (cx - x) + (cy - y) * (cy - y);
  }

  setScreenMatrix(matrix) {
    this.screenMatrix = matrix.slice(this.miny, this.maxy);
    for (var i = 0; i < this.maxy - this.miny; i++) {
      this.screenMatrix[i] = this.screenMatrix[i].slice(this.minx, this.maxx);
    }
    this.width = this.screenMatrix[0].length;
    this.height = this.screenMatrix.length;
  }

  findScreenCorners() {
    let x = 0;
    let y = 0;
    while (
      this.getMatrix(x, 0) !== this.blue &&
      this.getMatrix(x, 0) !== this.green
    )
      x++; //bovenhoek
    if (x >= this.screenMatrix[0].length / 2) {
      while (this.screenMatrix[0][x + 1] >= 1) ++x;
    }
    this.corners.push([x, 0, this.screenMatrix[0][x]]);

    x = this.screenMatrix[0].length - 1;

    while (
      this.screenMatrix[y][x] !== this.blue &&
      this.screenMatrix[y][x] !== this.green
    )
      y++; //rechterhoek
    if (y >= this.screenMatrix.length / 2) {
      while (this.screenMatrix[y + 1][x] >= 1) ++y;
    }
    this.corners.push([x, y, this.screenMatrix[y][x]]);
    y = this.screenMatrix.length - 1;
    while (
      this.screenMatrix[y][x] !== this.blue &&
      this.screenMatrix[y][x] !== this.green
    )
      x--; // onderhoek
    if (x <= this.screenMatrix.length / 2) {
      while (this.getMatrix(x - 1, y) >= 1) --x;
    }
    this.corners.push([x, y, this.screenMatrix[y][x]]);
    while (
      this.screenMatrix[y][0] !== this.blue &&
      this.screenMatrix[y][0] !== this.green
    )
      y--; //linkerhoek
    if (y <= this.screenMatrix.length / 2) {
      while (this.getMatrix(0, y - 1) >= 1) --y;
    }
    this.corners.push([0, y, this.screenMatrix[y][x]]);
    return this.corners;
  }

  findCorners() {
    // choosing diagonal or straight corner detection
    let diagonalSearch = false;

    // Find which corner search to use: perpendicular or diagonal.

    const ratio = 0.07;
    const minPixels = 10;
    const sd_threshold = 0.15;

    const testOffsetX = Math.max(Math.floor(ratio * this.width), minPixels);
    const testOffsetY = Math.max(Math.floor(ratio * this.height), minPixels);

    // Left variance
    let yValuesLeft = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < testOffsetX; x++) {
        if (this.screenMatrix[y][x] !== 0) yValuesLeft.push(y / this.height);
      }
    }
    let yValuesLeftAvg =
      yValuesLeft.reduce((t, n) => t + n) / yValuesLeft.length;

    let yValuesLeftVariance = Math.sqrt(
      yValuesLeft.reduce((t, n) => t + Math.pow(yValuesLeftAvg - n, 2)) /
        yValuesLeft.length
    );

    console.log('Left Variance: ' + yValuesLeftVariance);
    console.log(yValuesLeftVariance > 0.15 ? 'Straight' : 'Inclined');

    if (yValuesLeftVariance > sd_threshold) diagonalSearch = true;

    if (diagonalSearch) {
      // Diagonal search

      // left upper corner
      for (let k = 0; k <= this.width + this.height - 2; k++) {
        let found = false;
        for (let j = 0; j <= k; j++) {
          let i = k - j;
          if (
            i < this.height &&
            j < this.width &&
            this.screenMatrix[i][j] !== 0
          ) {
            this.corners.push([j, i, this.screenMatrix[i][j]]);
            found = true;
            break;
          }
        }
        if (found) break;
      }

      // right upper corner
      for (let k = 0; k <= this.width + this.height - 2; k++) {
        let found = false;
        for (let j = 0; j <= k; j++) {
          let i = k - j;
          if (
            i < this.height &&
            j < this.width &&
            this.screenMatrix[i][this.width - j - 1] !== 0
          ) {
            this.corners.push([
              this.width - j - 1,
              i,
              this.screenMatrix[i][this.width - j - 1]
            ]);
            found = true;
            break;
          }
        }
        if (found) break;
      }

      // right lower corner
      for (let k = 0; k <= this.width + this.height - 2; k++) {
        let found = false;
        for (let j = 0; j <= k; j++) {
          let i = k - j;
          if (
            i < this.height &&
            j < this.width &&
            this.screenMatrix[this.height - i - 1][this.width - j - 1] !== 0
          ) {
            this.corners.push([
              this.width - j - 1,
              this.height - i - 1,
              this.screenMatrix[this.height - i - 1][this.width - j - 1]
            ]);
            found = true;
            break;
          }
        }
        if (found) break;
      }

      // left lower corner
      for (let k = 0; k <= this.width + this.height - 2; k++) {
        let found = false;
        for (let j = 0; j <= k; j++) {
          let i = k - j;
          if (
            i < this.height &&
            j < this.width &&
            this.screenMatrix[this.height - i - 1][j] !== 0
          ) {
            this.corners.push([
              j,
              this.height - i - 1,
              this.screenMatrix[this.height - i - 1][j]
            ]);
            found = true;
            break;
          }
        }
        if (found) break;
      }
    } else {
      // Perpendicular search
      // left

      for (let x = 0; x < this.width; x++) {
        let found = false;
        let tempY = [];
        for (let y = 0; y < this.height; y++) {
          if (this.screenMatrix[y][x] !== 0) {
            tempY.push(y);
            found = true;
          }
        }
        if (found) {
          let medianY = tempY[Math.floor(tempY.length / 2)];
          this.corners.push([x, medianY, this.screenMatrix[medianY][x]]);
          break;
        }
      }

      // top
      for (let y = 0; y < this.height; y++) {
        let found = false;
        let tempX = [];
        for (let x = 0; x < this.width; x++) {
          if (this.screenMatrix[y][x] !== 0) {
            tempX.push(x);
            found = true;
          }
        }
        if (found) {
          let medianX = tempX[Math.floor(tempX.length / 2)];
          this.corners.push([medianX, y, this.screenMatrix[y][medianX]]);
          break;
        }
      }

      // right
      for (let x = 0; x < this.width; x++) {
        let found = false;
        let tempY = [];
        for (let y = 0; y < this.height; y++) {
          if (this.screenMatrix[y][this.width - x - 1] !== 0) {
            tempY.push(y);
            found = true;
          }
        }
        if (found) {
          let medianY = tempY[Math.floor(tempY.length / 2)];
          this.corners.push([
            this.width - x - 1,
            medianY,
            this.screenMatrix[medianY][this.width - x - 1]
          ]);
          break;
        }
      }
      // bottom
      for (let y = 0; y < this.height; y++) {
        let found = false;
        let tempX = [];
        for (let x = 0; x < this.width; x++) {
          if (this.screenMatrix[this.height - y - 1][x] !== 0) {
            tempX.push(x);
            found = true;
          }
        }
        if (found) {
          let medianX = tempX[Math.floor(tempX.length / 2)];
          this.corners.push([
            medianX,
            this.height - y - 1,
            this.screenMatrix[this.height - y - 1][medianX]
          ]);
          break;
        }
      }
    }

    // Order the corners the right way

    return this.corners;
  }

  calcAverage(list) {
    let sum = 0;
    for (let i = 0; i < list.length; i++) {
      sum += list[i];
    }
    return sum / list.length;
  }

  findScreenOrientation() {
    let radian = Math.atan(
      (this.corners[0][0] - this.corners[3][0]) /
        (this.corners[3][1] - this.corners[0][1])
    );
    let colorUp = this.findUpColor();
    let colorLeft = this.findLeftColor();
    if (colorUp === this.blue && colorLeft === this.green)
      radian += Math.PI / 2.0;
    else if (colorUp === this.green && colorLeft === this.green)
      radian += Math.PI;
    else if (colorUp === this.green && colorLeft === this.blue)
      radian += (3 * Math.PI) / 2.0;
    return (radian * 180) / Math.PI;
  }

  findUpColor() {
    let x = Math.floor((this.corners[1][0] + this.corners[0][0]) / 2);
    let y = Math.floor((this.corners[1][1] + this.corners[0][1]) / 2);
    return this.screenMatrix[y][x];
  }
  findLeftColor() {
    let x = Math.floor((this.corners[3][0] + this.corners[0][0]) / 2);
    let y = Math.floor((this.corners[3][1] + this.corners[0][1]) / 2);
    return this.screenMatrix[y][x];
  }

  createScreen() {
    this.corners.length = 0;
    let corners = this.findScreenCorners();
    let orientation = this.findScreenOrientation();
    for (let i = 0; i < corners.length; i++) {
      corners[i][0] += this.minx;
      corners[i][1] += this.miny;
    }

    return new Screen(corners, orientation);
  }

  getMatrix(x, y) {
    if (x < 0) x = 0;
    else if (x >= this.width) x = this.width - 1;
    if (y < 0) y = 0;
    else if (y >= this.height) y = this.height - 1;
    return this.screenMatrix[y][x];
  }
}
