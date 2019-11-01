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
    let diagonalSearch = true;

    // Find which corner search to use: perpendicular or diagonal.

    const ratio = 0.07;
    const minPixels = 10;

    const testOffsetX = Math.max(Math.floor(ratio * this.width), minPixels);
    const testOffsetY = Math.max(Math.floor(ratio * this.height), minPixels);

    // Left variance
    for (let y = 0; y < this.height; y++) {
      
    }

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
      for (let y = 0; y < this.height; y++) {
        if (this.screenMatrix[y][0] !== 0) {
          this.corners.push([0, y, this.screenMatrix[y][0]]);
        }
      }

      // top
      for (let x = 0; x < this.width; x++) {
        if (this.screenMatrix[0][x] !== 0) {
          this.corners.push([x, 0, this.screenMatrix[0][x]]);
        }
      }

      // right
      for (let y = 0; y < this.height; y++) {
        if (this.screenMatrix[y][this.width - 1] !== 0) {
          this.corners.push([
            this.height - 1,
            y,
            this.screenMatrix[y][this.width - 1]
          ]);
        }
      }
      // bottom
      for (let x = 0; x < this.width; x++) {
        if (this.screenMatrix[this.height - 1][x] !== 0) {
          this.corners.push([
            x,
            this.height - 1,
            this.screenMatrix[this.height - 1][x]
          ]);
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
