class Island {
  /**
   * Create and Island starting with this pixel
   * @param {Image} image
   * @param {int} x x co
   * @param {int} y y co
   * @param {int} id
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
    this.green = id;
    this.blue = id + 1;
    this.circle = id + 2;

    this.radiusFactor = 0.25;

    this.imgOriginal = imgOriginal;
    this.barcode = BarcodeScanner.scan2(this.getScreenImg(), 30);
    console.log(BarcodeScanner.scan2(this.getScreenImg(), 30))
  }

  isValid() {
    return this.calcMid() !== null && this.barcode !== null;
  }

  getScreenImg() {
    let canvas = document.createElement('canvas');
    canvas.width = this.imgOriginal.width;
    canvas.height = this.imgOriginal.height;
    let context = canvas.getContext("2d");
    context.putImageData(this.imgOriginal, 0, 0);
    return context.getImageData(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny)
  }

  /**
   * Add a pixel to the Island
   *
   * @param {int} x x co
   * @param {int} y y co

   add(x, y) {
    this.minx = Math.min(x, this.minx);
    this.miny = Math.min(y, this.miny);

    this.maxx = Math.max(x, this.maxx);
    this.maxy = Math.max(y, this.maxy);
  }
   */

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
    let cornerDetector = new CornerDetector(this.screenMatrix, this.midPoint, this.id)
    return cornerDetector.cornerDetection()
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
    if (lengthX === 0 || lengthY === 0) {
      return null;
    }

    //mediaan van gevonden circle pixels
    let midx = x_values.sort()[Math.floor(lengthX / 2)];
    let midy = y_values.sort()[Math.floor(lengthY / 2)];

    return [midx + this.minx, midy + this.miny];
  }

  cssTransMatrix(transMatrix) {
    return [transMatrix[1][1], transMatrix[2][1], 0, transMatrix[3][1],
    transMatrix[1][2], transMatrix[2][2], 0, transMatrix[3][2],
      0, 0, 1, 0,
    transMatrix[1][3], transMatrix[2][3], 0, [transMatrix[3][3]]]
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
    if (x < 0 || x >= this.width) return 0;
    if (y < 0 || y >= this.height) return 0;
    return this.screenMatrix[y][x];
  }
}
