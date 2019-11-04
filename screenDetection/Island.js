class Island {
  /**
   * Create and Island starting with this pixel
   * @param {Image} image
   * @param {int} x x co
   * @param {int} y y co
   * @param {int} id
   */
  constructor(x, y, id) {
    /*this.minx;
    this.maxx;
    this.miny;
    this.maxy;
    this.id;
    this.midPoint;
    this.orientation;

    this.blue;
    this.green;
    this.circle;

    this.width;
    this.height;
    */

    this.screenMatrix = [];

    this.corners = {
      LU: null,
      RU: null,
      RD: null,
      LD: null
    };

    this.minx = x;
    this.maxx = x;

    this.miny = y;
    this.maxy = y;

    this.id = id;
    this.green = id;
    this.blue = id + 1;
    this.circle = id + 2;
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
    let cx = (this.maxx - this.minx) / 2;
    let cy = (this.maxy - this.miny) / 2;

    return (cx - x) * (cx - x) + (cy - y) * (cy - y);
  }

  setScreenMatrix(matrix) {
    this.screenMatrix = matrix.slice(this.miny, this.maxy);
    for (let i = 0; i < this.maxy - this.miny; i++) {
      this.screenMatrix[i] = this.screenMatrix[i].slice(this.minx, this.maxx);
    }
    this.width = this.screenMatrix[0].length;
    this.height = this.screenMatrix.length;
  }

  findCorners() {
    // choosing diagonal or straight corner detection
    let diagonalSearch = false;
    let corners = [];

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

    //console.log('Left Variance: ' + yValuesLeftVariance);
    //console.log(yValuesLeftVariance > 0.15 ? 'Straight' : 'Inclined');

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
            corners.push([j, i, this.screenMatrix[i][j]]);
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
            corners.push([
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
            corners.push([
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
            corners.push([
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
          corners.push([x, medianY, this.screenMatrix[medianY][x]]);
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
          corners.push([medianX, y, this.screenMatrix[y][medianX]]);
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
          corners.push([
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
          corners.push([
            medianX,
            this.height - y - 1,
            this.screenMatrix[this.height - y - 1][medianX]
          ]);
          break;
        }
      }
    }


    // corners to absolute position
    for (let i = 0; i < corners.length; i++) {
      corners[i][0] += this.minx;
      corners[i][1] += this.miny;
    }

    console.log(corners);

    this.cleanCorners(corners, 30); // TODO shouldn't be hardcoded

    let distances = this.distToMid();
    this.recoScreen(distances);

  }

  cleanCorners(corners, radius) {
    let L = corners[0];
    let T = corners[1];
    let R = corners[2];
    let B = corners[3];

    if (Island.calcDist(L, T) <= radius) {
      if (Island.calcDist(R, B) <= radius) {
        console.error('Bad picture!');
      } else {
        // corners.splice(0, 2);
        // corners.splice(0, 0, [(L[0] + T[0]) / 2, (L[1] + T[1]) / 2, L[2]]);
        this.corners.LU = [(L[0] + T[0]) / 2, (L[1] + T[1]) / 2, L[2]];

        if (R[1] >= this.midPoint[1]) {
          this.corners.RD = R;
          this.corners.LD = B;
        } else {
          this.corners.RU = R;

          if (B[0] >= this.midPoint[0]) {
            this.corners.RD = B;
          } else this.corners.LD = B;
        }
      }
    } else if (Island.calcDist(T, R) <= radius) {
      if (Island.calcDist(L, B) <= radius) {
        console.error('Bad picture!');
      } else {
        // corners.splice(1, 2);
        // corners.splice(1, 0, [(T[0] + R[0]) / 2, (T[1] + R[1]) / 2, T[2]]);
        this.corners.RU = [(T[0] + R[0]) / 2, (T[1] + R[1]) / 2, T[2]];

        if (L[1] >= this.midPoint[1]) {
          this.corners.LD = L;
          this.corners.RD = B;
        } else {
          this.corners.LU = L;

          if (B[0] >= this.midPoint[0]) {
            this.corners.RD = B;
          } else this.corners.LD = B;
        }
      }
    } else if (Island.calcDist(R, B) <= radius) {
      // corners.splice(2, 2);
      // corners.splice(2, 0, [(R[0] + B[0]) / 2, (R[1] + B[1]) / 2, R[2]]);
      this.corners.RD = [(R[0] + B[0]) / 2, (R[1] + B[1]) / 2, R[2]];

      if (L[1] <= this.midPoint[1]) {
        this.corners.LU = L;
        this.corners.RU = T;
      } else {
        this.corners.LD = L;

        if (T[0] <= this.midPoint[0]) {
          this.corners.LU = T;
        } else this.corners.RU = T;
      }
    } else if (Island.calcDist(L, B) <= radius) {
      // corners.shift();
      // corners.pop();
      // corners.push([(L[0] + B[0]) / 2, (L[1] + B[1]) / 2, L[2]]);
      this.corners.LD = [(L[0] + B[0]) / 2, (L[1] + B[1]) / 2, L[2]];

      if (R[1] <= this.midPoint[1]) {
        this.corners.RU = R;
        this.corners.LU = T;
      } else {
        this.corners.RD = R;

        if (T[0] <= this.midPoint[0]) {
          this.corners.LU = T;
        } else this.corners.RU = T;
      }
    } else {
      if (T[0] >= this.midPoint[0]) {
        this.corners.LU = L;
        this.corners.RU = T;
        this.corners.RD = R;
        this.corners.LD = B;
      } else {
        this.corners.LU = T;
        this.corners.RU = R;
        this.corners.RD = B;
        this.corners.LD = L;
      }     
    }
  }

  OldcleanCorners(radius) {
    if (Island.calcDist(this.corners.LU, this.corners.RU) <= radius) {
      this.corners.RU = null;
    }
    if (Island.calcDist(this.corners.LU, this.corners.LD) <= radius) {
      this.corners.LD = null;
    }
    if (Island.calcDist(this.corners.RD, this.corners.RU) <= radius) {
      this.corners.RU = null;
    }
    if (Island.calcDist(this.corners.RD, this.corners.LD) <= radius) {
      this.corners.LD = null;
    }
  }

  distToMid() {
    let corners = Object.values(this.corners);

    let distances = [];
    let midPoint = this.midPoint;
    corners.forEach(function(corner) {
      if (corner !== null) {
        distances.push(Island.calcDist(corner, midPoint));
      } else distances.push(null);
    });
    return distances;
  }

  static calcDist(a, b) {
    if (b === null) return;
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  inRangeOf(dist, value) {
    return dist - value < 10 && dist - value > -10;
  }

  calcMid() {
    let x_values = [];
    let y_values = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getMatrix(x, y) === this.circle) {
          x_values.push(x);
          y_values.push(y);
        }
      }
    }

    let lengthX = x_values.length;
    let lengthY = y_values.length;
    let midX = Math.floor(x_values.reduce((a, b) => a + b, 0) / lengthX);
    let midY = Math.floor(y_values.reduce((a, b) => a + b, 0) / lengthY);

    return [midX + this.minx, midY + this.miny];
  }

  recoScreen(distances) {
    // check LU and RD
    if (distances[0] !== null) {
      if (distances[2] !== null) {
        if (
          !this.inRangeOf(distances[0], distances[2]) &&
          distances[0] > distances[2]
        ) {
          this.corners.RD = [
            this.midPoint[0] + (this.midPoint[0] - this.corners.LU[0]),
            this.midPoint[1] + (this.midPoint[1] - this.corners.LU[1]),
            this.corners.RD[2]
          ];
        } else if (!this.inRangeOf(distances[0], distances[2])) {
          this.corners.LU = [
            this.midPoint[0] - (this.corners.RD[0] - this.midPoint[0]),
            this.midPoint[1] - (this.corners.RD[1] - this.midPoint[1]),
            this.corners.LU[2]
          ];
        }
      }
      //distances[2](RD) equals null
      if (distances[2] === null) {
        this.corners.RD = [
          this.midPoint[0] + (this.midPoint[0] - this.corners.LU[0]),
          this.midPoint[1] + (this.midPoint[1] - this.corners.LU[1]),
          this.switchColor(this.corners.LU)
        ];
      }
    } else if (distances[0] === null) {
      //distances[0](LU) equals null
      this.corners.LU = [
        this.midPoint[0] - (this.corners.RD[0] - this.midPoint[0]),
        this.midPoint[1] - (this.corners.RD[1] - this.midPoint[1]),
        this.switchColor(this.corners.RD)
      ];
    }

    //check RU and LD
    if (distances[1] !== null) {
      if (distances[3] !== null) {
        if (
          !this.inRangeOf(distances[1], distances[3]) &&
          distances[1] > distances[3]
        ) {
          this.corners.LD = [
            this.midPoint[0] - (this.corners.RU[0] - this.midPoint[0]),
            this.midPoint[1] + (this.midPoint[1] - this.corners.RU[1]),
            this.corners.LD[2]
          ];
        } else if (!this.inRangeOf(distances[1], distances[3])) {
          this.corners.RU = [
            this.midPoint[0] + (this.midPoint[0] - this.corners.LD[0]),
            this.midPoint[1] - (this.corners.LD[1] - this.midPoint[1]),
            this.corners.RU[2]
          ];
        }
      }
      //distances[3](LD) equals null
      if (distances[3] === null) {
        this.corners.LD = [
          this.midPoint[0] - (this.corners.RU[0] - this.midPoint[0]),
          this.midPoint[1] + (this.midPoint[1] - this.corners.RU[1]),
          this.switchColor(this.corners.RD)
        ];
      }
    } else if (distances[1] === null) {
      //distances[1](RU) equals null
      this.corners.RU = [
        this.midPoint[0] + (this.midPoint[0] - this.corners.LD[0]),
        this.midPoint[1] - (this.corners.LD[1] - this.midPoint[1]),
        this.switchColor(this.corners.LD)
      ];
    }
  }

  switchColor(corner) {
    if (corner[2] === this.blue) return this.green;
    else return this.blue;
  }

  finishIsland() {
    this.midPoint = this.calcMid();
    this.findCorners();
    //this.orientation = this.findScreenOrientation();
  }

  findScreenOrientation() {
    //NOG LATER OP TERUG KOMEN, EERST RECONSTRUCTIE!!!

    /* let radian = Math.atan(
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
    return (radian * 180) / Math.PI; */

    switch (this.corners.length) {
      case 4:
        //no reconstruction needed
        console.log('alle 4 al gevonden');
        break;

      case 3:
        this.reconstructTripleCorners();
        break;

      default:
        break;
    }
  }

  reconstructTripleCorners() {
    //sort de 3 punten volgens x-co om inwendige hoek te bepalen
    this.corners = this.corners.sort(function(a, b) {
      return a[0] >= b[0];
    });

    let vec1 = [this.corners[1], this.corners[0]];
    let vec2 = [this.corners[1], this.corners[2]];

    //loodrechte rico op vec1
    //https://gamedev.stackexchange.com/questions/70075/how-can-i-find-the-perpendicular-to-a-2d-vector
    let m = (-vec1[1][0] - vec1[0][0]) / (vec1[1][1] - vec1[0][1]);

    //spiegelmatrix over loodrechte
    //https://yutsumura.com/the-matrix-for-the-linear-transformation-of-the-reflection-across-a-line-in-the-plane/
    let A = math.matrix([[1 - m * m, 2 * m], [2 * m, m * m - 1]]);
    A = math.multiply(1 / (1 + m * m), A);

    let mirror = math
      .multiply([vec2[1][0] - vec2[0][0], vec2[1][1] - vec2[0][1]], A)
      .add(vec2[0]); //gespiegelde vec2 over loodrechte aan vec1

    let corner = math.add(vec1, mirror)[1]; //reconstructie van 4de punt

    this.corners.push(corner);
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

  createScreen(clientInfo) {
    let corners = this.corners;
    let orientation = this.orientation;
    for (let i = 0; i < corners.length; i++) {
      corners[i][0] += this.minx;
      corners[i][1] += this.miny;
    }
    return new Screen(corners, orientation, this.midPoint, clientInfo);
  }

  getMatrix(x, y) {
    if (x < 0) x = 0;
    else if (x >= this.width) x = this.width - 1;
    if (y < 0) y = 0;
    else if (y >= this.height) y = this.height - 1;
    return this.screenMatrix[y][x];
  }
}
