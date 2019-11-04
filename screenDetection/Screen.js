class Screen {


  constructor(corners, orientation, midPoint, clientInfo) {
    this.corners = null;
    this.orientation = null;
    this.size = null;
    this.imgData = null;
    this.clientCode = null;
    this.midPoint = null;

    this.width = null;
    this.height = null;


    this.corners = corners;
    this.orientation = orientation;
    this.midPoint = midPoint;
    this.clientInfo = clientInfo;
    var area = 0;
    for (let i = 0; i < corners.length - 1; i++) {
      area += corners[i][0] * corners[i + 1][1] * 0.5;
      area -= corners[i + 1][0] * corners[i][1] * 0.5;
    }
    area += corners[3][0] * corners[0][1] * 0.5;
    area -= corners[0][0] * corners[3][1] * 0.5;
    this.size = Math.abs(area);
  }

  orientationMatrix() {
    return [
      [Math.cos(this.orientation), -Math.sin(this.orientation)],
      [Math.sin(this.orientation), Math.cos(this.orientation)]
    ];
  }

  /**
   * Calculates the imgData of the screen by cutting the given image using the screen corners
   */
  calculateScreenImage(inputCanvasImgData) {
    let screenImage;
    return screenImage;
  }

  /**
   * Find the client code from the encoded barcode in the screen
   */
  findClientCode() {
    let barcode = BarcodeScanner.scan(
      this.imgData,
      this.imgData.width,
      this.imgData.height,
      0.15
    );
    this.clientCode = PermutationConverter.decode(barcode);
    return barcode;
  }

  /**
   *source is array of 4 arrays containing source corners
   * destination is array of 4 arrays containing destination corners
   * return transformation matrix for 3d to 2d perspective change
   * math from https://stackoverflow.com/questions/14244032/redraw-image-from-3d-perspective-to-2d
   */
  transformationMatrix(source, destination) {
    let matrixA = this.findMapMatrix(destination);
    let matrixB = this.findMapMatrix(source);
    let matrixC = Algebra.dotMMsmall(matrixA, Algebra.inv(matrixB));
    this.transMatrix = matrixC;
    return matrixC;
  }
  findMapMatrix(corners) {
    let row1 = [corners[0][0], corners[1][0], corners[2][0]]; // x1,x2,x3
    let row2 = [corners[0][1], corners[1][1], corners[2][1]]; // y1,y2,y3
    let row3 = [1, 1, 1]; // 1 ,1 ,1
    let subMatrix1 = [row1, row2, row3];
    let subMatrix2 = [[corners[3][0]], [corners[3][1]], [1]]; // x4, y4, 1

    let resultMatrix = Algebra.dotMMsmall(Algebra.inv(subMatrix1), subMatrix2);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        subMatrix1[i][j] *= resultMatrix[j];
      }
    }
    return subMatrix1;
  }

  calcTranformationMatrix() {
    let destination = [
      [0, 0],
      [this.width, 0],
      [this.width, this.height],
      [0, this.height]
    ];
    this.transformationMatrix(destination, this.corners);
  }

  /**
   * Cut and transform the part of the screen from the given image
   * @param fullImage
   *        ImageData object containing the image to be cut
   * @returns {ImageData}
   *          Object containing the transformed screen cutout from the input image
   */
  mapToScreen(fullImage) {
    return this.map(fullImage, this.corners, this.width, this.height);
  }

  /**
   * Maps the old image data to new destination corners, see above for transformation matrix
   * The fullImage object has a data key.
   * data is an array with 4 values per pixel, for every pixel of the image, going from top to bottom, left to right
   */
  map(fullImage, srcCorners, width, height) {
    let data = fullImage.data;
    let destination = [[0, 0], [width, 0], [width, height], [0, height]];

    this.transformationMatrix(destination, srcCorners);
    let img = document
      .createElement('canvas')
      .getContext('2d')
      .createImageData(width, height);

    for (let ys = 0; ys < height; ys++) {
      for (let xs = 0; xs < width; xs++) {
        let srcCoord = this.transform([xs, ys]);
        let x = srcCoord[0];
        let y = srcCoord[1];

        let indexDest = (xs + ys * width) * 4;
        let index = (x + y * width) * 4;

        img.data[indexDest] = data[index];
        img.data[indexDest + 1] = data[index + 1];
        img.data[indexDest + 2] = data[index + 2];
        img.data[indexDest + 3] = data[index + 3];
      }
    }

    return img;
  }

  transform(srcPX) {
    let newCoord = Algebra.dotMMsmall(this.transMatrix, [
      [srcPX[0]],
      [srcPX[1]],
      [1]
    ]);
    let x = Math.round(newCoord[0] / newCoord[2]);
    let y = Math.round(newCoord[1] / newCoord[2]);

    return [x, y];
  }
}

// let newScreen = new Screen([1,2,5,4], 0)
// let srcCorners = [[158, 64], [494, 69], [495, 404], [158, 404]];
// let dstCorners =  [[150, 64], [494, 69], [495, 404], [158, 404]];
// // let dstCorners = [[100, 500], [152, 564], [148, 604], [100, 560]];
// // console.log(newScreen.findMapMatrix(dstCorners))
// console.log(newScreen.transformationMatrix(srcCorners, dstCorners))
// let matrix = newScreen.transformationMatrix(srcCorners, dstCorners)
// console.log(newScreen.dotMMsmall(matrix, [[117], [530],[1]]))

// let matrix = [12,14,15,36,12,54,78,9,63,21,45,21,45,99,87,42,26,74,65,66,26,36,14,25,36,24,15,14,12,36,25,47,85,96,78,96]
// let corners = [[1,1],[2,1],[2,2],[1,2]]
// let destination = [[0,0],[2,0],[2,2],[0,2]]
// newScreen.map(matrix, corners, destination)
