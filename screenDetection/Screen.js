class Screen {
  corners;
  orientation;
  size;
  imgData;
  clientCode;
  midPoint;

  width;
  height;

  constructor(corners, orientation, midPoint) {
    this.corners = corners;
    this.orientation = orientation;
    this.midPoint = midPoint;
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
    let barcode = scanner(
      this.imgData,
      this.imgData.width,
      this.imgData.height,
      0.15
    );
    this.clientCode = PermutationConverter.decode(barcode);
    return barcode;
  }

  /**
   * Linear algebra code from https://github.com/jlouthan/perspective-transform/blob/master/dist/perspective-transform.js
   */

  dim(x) {
    var y, z;
    if (typeof x === 'object') {
      y = x[0];
      if (typeof y === 'object') {
        z = y[0];
        if (typeof z === 'object') {
          return this.dim(x);
        }
        return [x.length, y.length];
      }
      return [x.length];
    }
    return [];
  }

  _foreach2(x, s, k, f) {
    if (k === s.length - 1) {
      return f(x);
    }
    var i,
      n = s[k],
      ret = Array(n);
    for (i = n - 1; i >= 0; i--) {
      ret[i] = this._foreach2(x[i], s, k + 1, f);
    }
    return ret;
  }

  cloneV(x) {
    var _n = x.length;
    var i,
      ret = Array(_n);

    for (i = _n - 1; i !== -1; --i) {
      ret[i] = x[i];
    }
    return ret;
  }

  clone(x) {
    if (typeof x !== 'object') return x;
    var V = this.cloneV;
    var s = this.dim(x);
    return this._foreach2(x, s, 0, V);
  }

  diag(d) {
    var i,
      i1,
      j,
      n = d.length,
      A = Array(n),
      Ai;
    for (i = n - 1; i >= 0; i--) {
      Ai = Array(n);
      i1 = i + 2;
      for (j = n - 1; j >= i1; j -= 2) {
        Ai[j] = 0;
        Ai[j - 1] = 0;
      }
      if (j > i) {
        Ai[j] = 0;
      }
      Ai[i] = d[i];
      for (j = i - 1; j >= 1; j -= 2) {
        Ai[j] = 0;
        Ai[j - 1] = 0;
      }
      if (j === 0) {
        Ai[0] = 0;
      }
      A[i] = Ai;
    }
    return A;
  }

  rep(s, v, k) {
    if (typeof k === 'undefined') {
      k = 0;
    }
    var n = s[k],
      ret = Array(n),
      i;
    if (k === s.length - 1) {
      for (i = n - 2; i >= 0; i -= 2) {
        ret[i + 1] = v;
        ret[i] = v;
      }
      if (i === -1) {
        ret[0] = v;
      }
      return ret;
    }
    for (i = n - 1; i >= 0; i--) {
      ret[i] = this.rep(s, v, k + 1);
    }
    return ret;
  }

  identity(n) {
    return this.diag(this.rep([n], 1));
  }

  inv(a) {
    var s = this.dim(a),
      abs = Math.abs,
      m = s[0],
      n = s[1];
    var A = this.clone(a),
      Ai,
      Aj;
    var I = this.identity(m),
      Ii,
      Ij;
    var i, j, k, x;
    for (j = 0; j < n; ++j) {
      var i0 = -1;
      var v0 = -1;
      for (i = j; i !== m; ++i) {
        k = abs(A[i][j]);
        if (k > v0) {
          i0 = i;
          v0 = k;
        }
      }
      Aj = A[i0];
      A[i0] = A[j];
      A[j] = Aj;
      Ij = I[i0];
      I[i0] = I[j];
      I[j] = Ij;
      x = Aj[j];
      for (k = j; k !== n; ++k) Aj[k] /= x;
      for (k = n - 1; k !== -1; --k) Ij[k] /= x;
      for (i = m - 1; i !== -1; --i) {
        if (i !== j) {
          Ai = A[i];
          Ii = I[i];
          x = Ai[j];
          for (k = j + 1; k !== n; ++k) Ai[k] -= Aj[k] * x;
          for (k = n - 1; k > 0; --k) {
            Ii[k] -= Ij[k] * x;
            --k;
            Ii[k] -= Ij[k] * x;
          }
          if (k === 0) Ii[0] -= Ij[0] * x;
        }
      }
    }
    return I;
  }

  dotMMsmall(x, y) {
    var i, j, k, p, q, r, ret, foo, bar, woo, i0;
    p = x.length;
    q = y.length;
    r = y[0].length;
    ret = Array(p);
    for (i = p - 1; i >= 0; i--) {
      foo = Array(r);
      bar = x[i];
      for (k = r - 1; k >= 0; k--) {
        woo = bar[q - 1] * y[q - 1][k];
        for (j = q - 2; j >= 1; j -= 2) {
          i0 = j - 1;
          woo += bar[j] * y[j][k] + bar[i0] * y[i0][k];
        }
        if (j === 0) {
          woo += bar[0] * y[0][k];
        }
        foo[k] = woo;
      }
      ret[i] = foo;
    }
    return ret;
  }

  dotMV(x, y) {
    var p = x.length,
      i;
    var ret = Array(p),
      dotVV = this.dotVV;
    for (i = p - 1; i >= 0; i--) {
      ret[i] = dotVV(x[i], y);
    }
    return ret;
  }

  dotVV(x, y) {
    var i,
      n = x.length,
      i1,
      ret = x[n - 1] * y[n - 1];
    for (i = n - 2; i >= 1; i -= 2) {
      i1 = i - 1;
      ret += x[i] * y[i] + x[i1] * y[i1];
    }
    if (i === 0) {
      ret += x[0] * y[0];
    }
    return ret;
  }

  transpose(x) {
    var i,
      j,
      m = x.length,
      n = x[0].length,
      ret = Array(n),
      A0,
      A1,
      Bj;
    for (j = 0; j < n; j++) ret[j] = Array(m);
    for (i = m - 1; i >= 1; i -= 2) {
      A1 = x[i];
      A0 = x[i - 1];
      for (j = n - 1; j >= 1; --j) {
        Bj = ret[j];
        Bj[i] = A1[j];
        Bj[i - 1] = A0[j];
        --j;
        Bj = ret[j];
        Bj[i] = A1[j];
        Bj[i - 1] = A0[j];
      }
      if (j === 0) {
        Bj = ret[0];
        Bj[i] = A1[0];
        Bj[i - 1] = A0[0];
      }
    }
    if (i === 0) {
      A0 = x[0];
      for (j = n - 1; j >= 1; --j) {
        ret[j][0] = A0[j];
        --j;
        ret[j][0] = A0[j];
      }
      if (j === 0) {
        ret[0][0] = A0[0];
      }
    }
    return ret;
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
    let matrixC = this.dotMMsmall(matrixA, this.inv(matrixB));
    this.transMatrix = matrixC;
    return matrixC;
  }
  findMapMatrix(corners) {
    let row1 = [corners[0][0], corners[1][0], corners[2][0]]; // x1,x2,x3
    let row2 = [corners[0][1], corners[1][1], corners[2][1]]; // y1,y2,y3
    let row3 = [1, 1, 1]; // 1 ,1 ,1
    let subMatrix1 = [row1, row2, row3];
    let subMatrix2 = [[corners[3][0]], [corners[3][1]], [1]]; // x4, y4, 1

    let resultMatrix = this.dotMMsmall(this.inv(subMatrix1), subMatrix2);
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
    let newCoord = this.dotMMsmall(this.transMatrix, [
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
