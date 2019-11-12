class Image {

  constructor(imgData, canvasName, colorSpace, width, height, clientInfo) {

    this.clientInfo = clientInfo;

    this.sensitivity = 12;
    this.colorSpaces = ['RGBA', 'HSLA', 'BW'];
    this.islandID = 4; //jumps per three so we can save green and blue within an island.
    this.screens = [];
    this.pictureCanvas = null;
    this.width = width;
    this.height = height;
    this.islands = [];

    if (colorSpace === 'RGBA'){
      this.imgOriginal = imgData
    }

    this.setPixels(imgData.data);
    this.qualityCheck();
    this.setCanvas(canvasName, imgData.width, imgData.height);
    this.setColorSpace(colorSpace);
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d');
      context.putImageData(imgData, 0, 0);
    }
    this.drawer = new Drawer(this.getPixels(), this.getWidth(), this.getHeight());

    this.matrix = new Array(this.getHeight());
    for (let i = 0; i < this.getHeight(); i++) {
      this.matrix[i] = new Array(this.getWidth());
    }

    this.analyse()
  }

  analyse(){
    ColorSpace.rgbaToHsla(this.pixels)
    this.setColorSpace("HSLA")
    this.createBigMask();
    this.createOffset(3);
    this.createScreens();
    this.createPictureCanvas(300, 500); //TODO: param meegeven
    this.calcRelativeScreens(); //untested
    console.log("picture canvas: " + Object.values(this.pictureCanvas));
    return this.screens;
  }

  getImgData() {
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d');
      let imgData = context.createImageData(
        this.canvas.width,
        this.canvas.height
      );
      imgData.data.set(this.pixels);
      return imgData;
    } else {
      return this.imgData;
    }
  }

//TODO: check resolution ook
  qualityCheck() {
    let RGBA = false
    if(this.getColorSpace() == 'RGBA'){
      ColorSpace.rgbaToHsla(this.pixels)
      this.setColorSpace('HSLA')
      RGBA = true;
    }
    if(this.getColorSpace() !== 'HSLA'){
      console.error("Picture has to be in HSLA to do a quality check!")
    } else if (ColorSpace.calcLuminance(this.pixels) < 40 || 80 < ColorSpace.calcLuminance(this.pixels)) {
      console.error('Take a better picture');
    }
    if(RGBA){
      ColorSpace.hslaToRgba(this.pixels)
      this.setColorSpace('RGBA')
    }
  }

  /**
   * Returns all the data from screens and main without images
   */
  getAllData() {
    return true;
  }

  getColorSpace() {
    return this.colorSpace;
  }

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  setPixels(pixels) {
    this.pixels = pixels;
  }

  getPixels() {
    return this.pixels;
  }

  setCanvas(canvasName, width, height) {
    this.canvas = document.getElementById(canvasName);
    if (this.canvas !== null) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  setColorSpace(newColorSpace) {
    if (!this.colorSpaces.includes(newColorSpace)) {
      console.error("colorspace '" + newColorSpace + "' doesn't exist!");
    }
    this.colorSpace = newColorSpace;
  }

  show() {
    if (this.canvas !== null) {
      let context = this.canvas.getContext('2d');
      context.putImageData(this.getImgData(), 0, 0);
    }
  }

  calcIslandsFloodfill() {
    let tmpIslands = [];
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        if (this.checkId(x, y)) {
          let newIslandCoo = this.floodfill(x, y, this.islandID);
          let newIsland = new Island([newIslandCoo[0], newIslandCoo[1]], [newIslandCoo[2], newIslandCoo[3]], this.islandID, this.imgOriginal);
          tmpIslands.push(newIsland);
          this.islandID += 3;
        }
      }
    }
    for (let i = 0; i < tmpIslands.length; i++) {
      tmpIslands[i].setScreenMatrix(this.matrix);
      if (tmpIslands[i].isValid()) {
        tmpIslands[i].finishIsland();
        this.islands.push(tmpIslands[i]);
      }
    }
  }

  floodfill(xPos, yPos, islandID) {
    let stack = [[xPos, yPos]];
    let pixel;
    let x;
    let y;
    let minX = xPos;
    let minY = yPos;
    let maxX = xPos;
    let maxY = yPos;
    while (stack.length > 0) {
      pixel = stack.pop();
      x = pixel[0];
      y = pixel[1];
      if (this.getMatrix(x, y) <= 3) {
        this.matrix[y][x] += islandID - 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        if (this.checkId(x - 1, y)) {
          stack.push([x - 1, y]);
        }
        if (this.checkId(x + 1, y)) {
          stack.push([x + 1, y]);
        }
        if (this.checkId(x, y - 1)) {
          stack.push([x, y - 1]);
        }
        if (this.checkId(x, y + 1)) {
          stack.push([x, y + 1]);
        }
      }
    }
    return [minX, minY, maxX, maxY];
  }

  /**
   * Check if the position belongs to the formed island.
   * @param x
   * @param y
   * @returns {boolean}
   */

  checkId(x, y) {
    return (
      this.getMatrix(x, y) === 1 ||
      this.getMatrix(x, y) === 2 ||
      this.getMatrix(x, y) === 3
    );
  }

  createScreens() {
    //this.screens.length = 0;
    this.screens = [];
    this.calcIslandsFloodfill();
    for (let i = 0; i < this.islands.length; i++) {
      this.drawIsland(this.islands[i]);
      let newScreen = this.islands[i].createScreen(this.clientInfo);
      this.screens.push(newScreen);
    }
  }

  /**
   * map the the given image size around the found screens
   * 
   * @param {int} w image width
   * @param {int} h image height
   */
  createPictureCanvas(w, h){
    this.pictureCanvas = {
      minx: null,
      maxx: null,
      miny: null,
      maxy: null,
      scale: 1
    };

    let allCorners = [];

    this.screens.forEach(function (e) {
      for (let key in e.corners) {
        allCorners.push(e.corners[key]);
      }
    });

    //sort on x co
    allCorners.sort(function (a, b) {
      return a[0] >= b[0];
    });

    this.pictureCanvas["minx"] = allCorners[0][0];
    this.pictureCanvas["maxx"] = allCorners[allCorners.length - 1][0];

    //sort on y co
    allCorners.sort(function (a, b) {
      return a[1] >= b[1];
    });

    this.pictureCanvas["miny"] = allCorners[0][1];
    this.pictureCanvas["maxy"] = allCorners[allCorners.length - 1][1];

    //scale image to min size containing all screens
    let pc = this.pictureCanvas;
    if (pc.minx + w < pc.maxx) {
      let fac = (pc.maxx - pc.minx) / w;
      w = w * fac;
      h = h * fac;
    }
    if (pc.miny + h < pc.maxy) {
      let fac = (pc.maxy - pc.miny) / h;
      w = w * fac;
      h = h * fac;
    }

    this.pictureCanvas.maxx = pc.minx + w;
    this.pictureCanvas.maxy = pc.miny + h;
    this.pictureCanvas.scale = (this.pictureCanvas.maxx - this.pictureCanvas.minx) / w;

    return w, h;
  }

  /**
   * Recalculate every screen's corner to match up with the mapped image pixels
   */
  calcRelativeScreens(){
    let originX = this.pictureCanvas.minx;
    let originY = this.pictureCanvas.miny;
    this.screens.forEach(function(s){
      for(let key in s.corners){
        s.relativeCorners[key][0] = s.corners[key][0] - originX;
        s.relativeCorners[key][1] = s.corners[key][1] - originY;
      }
    })
  }

  /*
  medianBlur(ksize) {
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        let LArray = [];

        let halfKsize = Math.floor(ksize / 2);
        for (let yBox = -halfKsize; yBox <= halfKsize; yBox++) {
          for (let xBox = -halfKsize; xBox <= halfKsize; xBox++) {
            let pixel = this.getPixel(x + xBox, y + yBox);
            LArray.push(pixel[2]);
          }
        }
        LArray.sort(function(a, b) {
          return a - b;
        });

        let i = this.pixelToPosition([x, y]);
        let half = Math.floor(LArray.length / 2);
        this.pixels[i + 2] = LArray[half];
      }
    }
  }
  */
  /*
  medianBlurMatrix(ksize) {
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        let LArray = [];

        let halfKsize = Math.floor(ksize / 2);
        for (let yBox = -halfKsize; yBox <= halfKsize; yBox++) {
          for (let xBox = -halfKsize; xBox <= halfKsize; xBox++) {
            if (
              y + yBox >= 0 &&
              y + yBox < this.getHeight() &&
              x + xBox >= 0 &&
              x + xBox < this.getWidth()
            ) {
              let pixel = this.matrix[y + yBox][x + xBox];
              LArray.push(pixel);
            }
          }
        }
        LArray.sort(function(a, b) {
          return a - b;
        });
        let half = Math.floor(LArray.length / 2);
        this.matrix[y][x] = LArray[half];
      }
    }
  }
  */

  createOffset(factor) {
    let whites = [];
    for (let y = 0; y < this.getHeight(); y++) {
      for (let x = 0; x < this.getWidth(); x++) {
        if (this.getMatrix(x, y) > 0) {
          whites.push([x, y]);
        }
      }
    }
    for (let i = 0; i < whites.length; i++) {
      for (let yBox = -factor; yBox <= factor; yBox++) {
        for (let xBox = -factor; xBox <= factor; xBox++) {
          let x = whites[i][0];
          let y = whites[i][1];
          let value = this.getMatrix(x, y);
          if (
            y + yBox >= 0 &&
            y + yBox < this.getHeight() &&
            x + xBox >= 0 &&
            x + xBox < this.getWidth() &&
            this.getMatrix(x + xBox, y + yBox) === 0
          ) {
            this.matrix[y + yBox][x + xBox] = value;
          }
        }
      }
    }
  }

  getPixel(xPixel, yPixel) {
    if (xPixel < 0) {
      xPixel = 0;
    } else if (xPixel >= this.getWidth()) {
      xPixel = this.getWidth() - 1;
    }

    if (yPixel < 0) {
      yPixel = 0;
    } else if (yPixel >= this.getHeight()) {
      yPixel = this.getHeight() - 1;
    }
    let i = (yPixel * this.getWidth() + xPixel) * 4;
    return [this.pixels[i], this.pixels[i + 1], this.pixels[i + 2]];
  }

  createBigMask() {
    if (this.getColorSpace() !== 'HSLA') {
      console.error('createGreenBlueMask only with HSLA as colorspace!');
    }
    for (let i = 0; i < this.pixels.length; i += 4) {
      let H = this.pixels[i] * 2;
      let S = this.pixels[i + 1];
      let L = this.pixels[i + 2];
      let pixel = this.positionToPixel(i);
      let x = pixel[0];
      let y = pixel[1];
      if (ColorRange.inGreenRange(H, S, L)) {
        this.matrix[y][x] = 1;
      } else if (ColorRange.inBlueRange(H, S, L)) {
        this.matrix[y][x] = 2;
      } else if (ColorRange.inMidRange(H, S, L)) {
        this.matrix[y][x] = 3;
      } else {
        this.matrix[y][x] = 0;
      }
    }
  }

  getMatrix(x, y) {
    if (x < 0) x = 0;
    else if (x >= this.getWidth()) x = this.getWidth() - 1;
    if (y < 0) y = 0;
    else if (y >= this.getHeight()) y = this.getHeight() - 1;
    return this.matrix[y][x];
  }

  positionToPixel(position) {
    position /= 4;
    let x = position % this.getWidth();
    let y = (position - x) / this.getWidth();
    return [x, y];
  }

  pixelToPosition(pixel) {
    return (pixel[1] * this.getWidth() + pixel[0]) * 4;
  }

  drawIsland(island) {
    this.drawer.drawFillRect(
        this.pixels,
        [island.minx, island.miny],
        [island.maxx, island.maxy]
    );
    this.drawer.drawCorners(island);
    this.drawer.drawMid(island);
  }

  /**
   * Clone a ImageData Object
   * @param src
   *        Source ImageData object
   * @returns {ImageData}
   *        Copy of given ImageData object
   */
  static copyImageData(src) {
    return new ImageData(
      new Uint8ClampedArray(src.data),
      src.width,
      src.height
    );
  }
}
