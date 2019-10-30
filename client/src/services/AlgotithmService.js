import Image from '../algorithms/Image'

export default {
  fullAnalysis(imgData) {
    let inputImage = new Image(imgData, '', 'RGBA')

    inputImage.rgbaToHsla()
    inputImage.createGreenBlueMask()
    inputImage.medianBlurMatrix(3)
    inputImage.createScreens()

    return inputImage
  }
}
