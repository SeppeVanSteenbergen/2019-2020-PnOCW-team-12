class Island {
  /**
   * Create and Island starting with this pixel
   * @param leftUpperCoo
   * @param rightBottomCoo
   * @param {int} id
   * @param imgOriginal
   */
  constructor(leftUpperCoo, rightBottomCoo, id, imgOriginal) {
    this.screenMatrix = [];

    // coordinates seen from original matrix
    this.corners = {
      LU: null,
      RU: null,
      RD: null,
      LD: null
    };

    this.minx = leftUpperCoo[0];
    this.maxx = rightBottomCoo[0];

    this.miny = leftUpperCoo[1];
    this.maxy = rightBottomCoo[1];

    this.id = id;
    this.yellow = id;
    this.pink = id + 1;
    this.circle = id + 2;

    this.imgOriginal = imgOriginal;
    this.barcode = BarcodeScanner.scan(this.getScreenImg());
    //console.log(this.barcode)
  }

  isValid() {
    return this.calcMid() !== null && this.barcode !== 0;
  }

  getScreenImg() {
    let canvas = document.createElement('canvas');
    canvas.width = this.imgOriginal.width;
    canvas.height = this.imgOriginal.height;
    let context = canvas.getContext("2d");
    context.putImageData(this.imgOriginal, 0, 0);
    return context.getImageData(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny)
  }

  print() {
    console.log('starting co: ' + this.minx + ', ' + this.miny);
    console.log('ending co: ' + this.maxx + ', ' + this.maxy);
  }

  add(x, y) {
    if (x > this.maxx) this.maxx = x;
    if (x < this.minx) this.minx = x;
    if (y > this.maxy) this.maxy = y;
    if (y < this.miny) this.miny = y;
  }

  size() {
    return (this.maxx - this.minx) * (this.maxy - this.miny);
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
    let cornerDetector = new CornerDetector(this.screenMatrix, this.midPoint, this.id)
    let detectedCorners = cornerDetector.cornerDetection()
    //this.corners.LU = [detectedCorners.LU[0], detectedCorners.LU[1]]
    //this.corners.LD = [detectedCorners.LD[0], detectedCorners.LD[1]]
    //this.corners.RU = [detectedCorners.RU[0], detectedCorners.RU[1]]
    //this.corners.RD = [detectedCorners.RD[0], detectedCorners.RD[1]]
  }

  calcMid() {
    let xValues = [];
    let yValues = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getMatrix(x, y) === this.circle) {
          xValues.push(x);
          yValues.push(y);
        }
      }
    }

    let lengthX = xValues.length;
    let lengthY = yValues.length;
    if (lengthX === 0 || lengthY === 0) {
      return null;
    }

    let sumX = xValues.reduce((previous, current) => current += previous);
    let sumY = yValues.reduce((previous, current) => current += previous);

    return [Math.round(sumX / lengthX), Math.round(sumY / lengthY)];
  }

  cssTransMatrix(transMatrix) {
    return [transMatrix[1][1], transMatrix[2][1], 0, transMatrix[3][1],
    transMatrix[1][2], transMatrix[2][2], 0, transMatrix[3][2],
      0, 0, 1, 0,
    transMatrix[1][3], transMatrix[2][3], 0, [transMatrix[3][3]]]
  }

  switchColor(corner) {
    if (corner[2] === this.pink) return this.yellow;
    else return this.pink;
  }

  finishIsland() {
    // console.log(this.barcode);
    this.midPoint = this.calcMid();
    this.findCorners();
    // console.log(this.circle);
    // console.log(this.midPoint);
    // console.log(this.screenMatrix);
    //this.orientation = this.findScreenOrientation();
    this.localToWorld();
  }

  localToWorld() {
    this.midPoint = [this.midPoint[0] + this.minx, this.midPoint[1] + this.miny];
    this.corners.LU = [this.corners.LU[0] + this.minx, this.corners.LU[1] + this.miny];
    this.corners.LD = [this.corners.LD[0] + this.minx, this.corners.LD[1] + this.miny];
    this.corners.RU = [this.corners.RU[0] + this.minx, this.corners.RU[1] + this.miny];
    this.corners.RD = [this.corners.RD[0] + this.minx, this.corners.RD[1] + this.miny];
  }

  createScreen(clientInfo) {
    let corners = this.corners;
    let orientation = null;
    /*for (let i = 0; i < corners.length; i++) {
      corners[i][0] += this.minx;
      corners[i][1] += this.miny;
    }*/
    return new Screen(
      corners,
      orientation,
      this.midPoint,
      clientInfo,
      this.imgOriginal
    );
  }

  getMatrix(x, y) {
    if (x < 0 || x >= this.width) return -1;
    if (y < 0 || y >= this.height) return -1;
    return this.screenMatrix[y][x];
  }
}
