import Image from '../algorithms/Image'

export default {
  fullAnalysis(imgData, clientInfo) {
    let inputImage = new Image(imgData, null, 'RGBA', clientInfo)

    console.log('input image:')
    console.log(inputImage)

    inputImage.rgbaToHsla()
    inputImage.createGreenBlueMask()
    inputImage.medianBlurMatrix(3)
    inputImage.createScreens()

    return inputImage
  },

  drawScreenOutlines(c, aImage) {
    let ctx = c.getContext('2d')
    ctx.strokeStyle = '#ff0000'
    let s = aImage.screens
    for (let i = 0; i < s.length; i++) {
      ctx.beginPath()
      ctx.moveTo(s[i].corners[0][0], s[i].corners[0][1])
      ctx.lineTo(s[i].corners[1][0], s[i].corners[1][1])
      ctx.lineTo(s[i].corners[2][0], s[i].corners[2][1])
      ctx.lineTo(s[i].corners[3][0], s[i].corners[3][1])
      ctx.lineTo(s[i].corners[0][0], s[i].corners[0][1])
      ctx.closePath()
      ctx.stroke()
    }
  },

  copyImageData(ctx, src) {
    let dst = ctx.createImageData(src.width, src.height)
    dst.data.set(src.data)
    return dst
  }
}
