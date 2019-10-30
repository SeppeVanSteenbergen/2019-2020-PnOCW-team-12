import PermutationConverter from './numberConverter'

import BarcodeScanner from './BarcodeScanner'

export default class Screen {
  constructor(corners, orientation) {

    this.corners = null
    this.orientation = null
    this.size = null
    this.imgData = null
    this.clientCode = null




    this.corners = corners
    this.orientation = orientation
    var area = 0
    for (let i = 0; i < corners.length - 1; i++) {
      area += corners[i][0] * corners[i + 1][1] * 0.5
      area -= corners[i + 1][0] * corners[i][1] * 0.5
    }
    area += corners[3][0] * corners[0][1] * 0.5
    area -= corners[0][0] * corners[3][1] * 0.5
    this.size = Math.abs(area)
  }

  orientationMatrix() {
    return [
      [Math.cos(this.orientation), -Math.sin(this.orientation)],
      [Math.sin(this.orientation), Math.cos(this.orientation)]
    ]
  }

  /**
   * Calculates the imgData of the screen by cutting the given image using the screen corners
   */
  calculateScreenImage(inputCanvasImgData) {
    let screenImage

    return screenImage
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
    )
    this.clientCode = PermutationConverter.decode(barcode)
    return barcode
  }
}
