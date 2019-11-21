class Screen {
  constructor(corners, midPoint, clientInfo, clientCode, screenImgOriginal) {
    this.corners = corners;
    this.relativeCorners = corners;
    this.midPoint = midPoint;
    this.clientInfo = clientInfo;
    this.clientCode = clientCode;

    if (typeof this.clientInfo !== 'undefined' && this.clientCode !== null) {
      this.width = this.clientInfo[this.clientCode].size.width;
      this.height = this.clientInfo[this.clientCode].size.height;
      this.calcTranformationMatrix();
      console.log(this.transMatrix)
    }
  }

  orientationMatrix() {
    return [
      [Math.cos(this.orientation), -Math.sin(this.orientation)],
      [Math.sin(this.orientation), Math.cos(this.orientation)]
    ];
  }

  /**
   * Find the client code from the encoded barcode in the screen
   */
  findClientCode(img) {
    let barcode = BarcodeScanner.scan(img, 30);
    // let barcode2 = BarcodeScanner.scan2(img, 30)
    console.log('barcode 1: ' + barcode);
    // console.log('barcode 2: ' + barcode2)
    if (barcode !== null) {
      return PermutationConverter.decode(barcode);
    }
    return null;
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
    let matrixC = Algebra.dotMMsmall(matrixA, Algebra.valueM(Algebra.det(matrixB), Algebra.inv(matrixB)));
    this.transMatrix = matrixC;
    return matrixC;
  }

  cssTransMatrix(transMatrix) {
    return [
      transMatrix[1][1],
      transMatrix[2][1],
      0,
      transMatrix[3][1],
      transMatrix[1][2],
      transMatrix[2][2],
      0,
      transMatrix[3][2],
      0,
      0,
      1,
      0,
      transMatrix[1][3],
      transMatrix[2][3],
      0,
      [transMatrix[3][3]]
    ];
  }

  findMapMatrix(corners) {
    let row1 = [corners.LU[0], corners.RU[0], corners.RD[0]]; // x1,x2,x3
    let row2 = [corners.LU[1], corners.RU[1], corners.RD[1]]; // y1,y2,y3
    let row3 = [1, 1, 1]; // 1 ,1 ,1
    let subMatrix1 = [row1, row2, row3];
    let subMatrix2 = [[corners.LD[0]], [corners.LD[1]], [1]]; // x4, y4, 1

    let resultMatrix = Algebra.dotMMsmall(Algebra.inv(subMatrix1), subMatrix2);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        subMatrix1[i][j] *= resultMatrix[j];
      }
    }
    return subMatrix1;
  }

  calcTranformationMatrix() {
    let destination = {
      LU: [0, 0],
      RU: [this.width, 0],
      RD: [this.width, this.height],
      LD: [0, this.height]
    };
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
