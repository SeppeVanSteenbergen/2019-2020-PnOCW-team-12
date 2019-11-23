import BarcodeScanner from './BarcodeScanner'
import PermutationConverter from './PermutationConverter'
import Algebra from './Algebra'

export default class Screen {
  constructor(corners, midPoint, clientInfo, clientCode, screenImgOriginal) {
    this.corners = []
    this.corners.push(corners.LU)
    this.corners.push(corners.RU)
    this.corners.push(corners.RD)
    this.corners.push(corners.LD)
    this.relativeCorners = corners
    this.midPoint = midPoint
    this.clientInfo = clientInfo
    this.clientCode = clientCode

    if (screenImgOriginal !== null && clientInfo !== null) {
      //let transformedTempImage = screenImgOriginal
      /*this.map(
        screenImgOriginal,
        this.corners,
        600,
        600
      );*/

      console.log('transformed image')
      //console.log(transformedTempImage);
      //this.clientCode = this.findClientCode(transformedTempImage)
      console.log('clientCode: ' + this.clientCode)

      if (typeof this.clientInfo !== 'undefined' && this.clientCode !== null) {
        this.width = this.clientInfo[this.clientCode].size.width
        this.height = this.clientInfo[this.clientCode].size.height

        this.calcTranformationMatrix()
        this.cssMatrix = this.cssTransMatrix(this.transMatrix)
      }
    }
  }

  orientationMatrix() {
    return [
      [Math.cos(this.orientation), -Math.sin(this.orientation)],
      [Math.sin(this.orientation), Math.cos(this.orientation)]
    ]
  }

  /**
   * Find the client code from the encoded barcode in the screen
   */
  findClientCode(img) {
    let barcode = BarcodeScanner.scan(img, 30)
    // let barcode2 = BarcodeScanner.scan2(img, 30)
    console.log('barcode 1: ' + barcode)
    // console.log('barcode 2: ' + barcode2)
    if (barcode !== null) {
      return PermutationConverter.decode(barcode)
    }
    return null
  }

  /**
   *source is array of 4 arrays containing source corners
   * destination is array of 4 arrays containing destination corners
   * return transformation matrix for 3d to 2d perspective change
   * math from https://stackoverflow.com/questions/14244032/redraw-image-from-3d-perspective-to-2d
   */
  transformationMatrix(source, destination) {
    let matrixA = this.findMapMatrix(destination)
    let matrixB = this.findMapMatrix(source)
    let matrixC = Algebra.dotMMsmall(matrixA, Algebra.inv(matrixB))
    this.transMatrix = matrixC
    this.transMatrixCSS = this.cssTransMatrix(matrixC)
    return matrixC
  }

  cssTransMatrix(transMatrix) {
    return [
      transMatrix[0][0],
      transMatrix[1][0],
      0,
      transMatrix[2][0],
      transMatrix[0][1],
      transMatrix[1][1],
      0,
      transMatrix[2][1],
      0,
      0,
      1,
      0,
      transMatrix[0][2],
      transMatrix[1][2],
      0,
      transMatrix[2][2]
    ]
  }

  findMapMatrix(corners) {
    let row1 = [corners[0][0], corners[1][0], corners[2][0]] // x1,x2,x3
    let row2 = [corners[0][1], corners[1][1], corners[2][1]] // y1,y2,y3
    let row3 = [1, 1, 1] // 1 ,1 ,1
    let subMatrix1 = [row1, row2, row3]
    let subMatrix2 = [[corners[3][0]], [corners[3][1]], [1]] // x4, y4, 1

    let resultMatrix = Algebra.dotMMsmall(Algebra.inv(subMatrix1), subMatrix2)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        subMatrix1[i][j] *= resultMatrix[j]
      }
    }
    return subMatrix1
  }

  calcTranformationMatrix() {
    let destination = [
      [0, 0],
      [this.width, 0],
      [this.width, this.height],
      [0, this.height]
    ]
    this.transformationMatrix(this.corners, destination)
  }

  /**
   * Cut and transform the part of the screen from the given image
   * @param fullImage
   *        ImageData object containing the image to be cut
   * @returns {ImageData}
   *          Object containing the transformed screen cutout from the input image
   */
  mapToScreen(fullImage) {
    return this.map(fullImage, this.corners, this.width, this.height)
  }

  mapToScreenCV(image) {
    let src = cv.matFromImageData(image)
    let dst = new cv.Mat()
    let dsize = new cv.Size(this.width, this.height)

    let destination = [
      [0, 0],
      [this.width, 0],
      [this.width, this.height],
      [0, this.height]
    ]
    let srcCorners = []

    for (let i = 0; i < this.corners.length; i++) {
      srcCorners.push(this.corners[i][0])
      srcCorners.push(this.corners[i][1])
    }

    let dstCorners = JSON.parse('[' + destination.toString() + ']')

    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, srcCorners)
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, dstCorners)
    let M = cv.getPerspectiveTransform(srcTri, dstTri)
    // You can try more different parameters
    cv.warpPerspective(
      src,
      dst,
      M,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar()
    )
    src.delete()
    M.delete()
    srcTri.delete()
    dstTri.delete()
    let dat = dst.data
    dst.delete()

    return new ImageData(new Uint8ClampedArray(dat), this.width, this.height)
  }

  /**
   * Maps the old image data to new destination corners, see above for transformation matrix
   * The fullImage object has a data key.
   * data is an array with 4 values per pixel, for every pixel of the image, going from top to bottom, left to right
   */
  map(fullImage, srcCorners, width, height) {
    let data = fullImage.data
    let destination = [[0, 0], [width, 0], [width, height], [0, height]]

    this.transformationMatrix(destination, srcCorners)
    let img = document
      .createElement('canvas')
      .getContext('2d')
      .createImageData(width, height)

    for (let ys = 0; ys < height; ys++) {
      for (let xs = 0; xs < width; xs++) {
        let srcCoord = this.transform([xs, ys])
        let x = srcCoord[0]
        let y = srcCoord[1]

        let indexDest = (xs + ys * width) * 4
        let index = (x + y * width) * 4

        img.data[indexDest] = data[index]
        img.data[indexDest + 1] = data[index + 1]
        img.data[indexDest + 2] = data[index + 2]
        img.data[indexDest + 3] = data[index + 3]
      }
    }
    return img
  }

  transform(srcPX) {
    let newCoord = Algebra.dotMMsmall(this.transMatrix, [
      [srcPX[0]],
      [srcPX[1]],
      [1]
    ])
    let x = Math.round(newCoord[0] / newCoord[2])
    let y = Math.round(newCoord[1] / newCoord[2])

    return [x, y]
  }
}
