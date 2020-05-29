/**
 * Overblijvende functies van de Image class met alle static methodes en main thread functies
 */
export default class ImageTools {

  static resizeImageData(imgData, border) {
    let scaleWidth = border[0] / imgData.width
    let scaleHeight = border[1] / imgData.height
    let scale = Math.min(scaleWidth, scaleHeight)

    if (scale >= 1) {
      return imgData
    }

    let canvas = document.createElement('canvas')
    canvas.width = imgData.width * scale
    canvas.height = imgData.height * scale
    let ctx = canvas.getContext('2d')

    let copyCanvas = document.createElement('canvas')
    copyCanvas.width = imgData.width
    copyCanvas.height = imgData.height
    let copyCtx = copyCanvas.getContext('2d')
    copyCtx.putImageData(imgData, 0, 0)

    ctx.drawImage(copyCanvas, 0, 0, canvas.width, canvas.height)
    return ctx.getImageData(0, 0, canvas.width, canvas.height)
  }

  static show(canvas, drawer) {
    if (canvas !== null) {
      let context = canvas.getContext('2d')
      context.putImageData(this.getImgData(), 0, 0)

      drawer._finishLines()
    }
  }

  /**
   * Returns the coordinate in the matrix of the given position in the pixel array.
   * @param position
   *        The position of the element in the pixel array.
   * @returns {[number, number]}
   *          The x and y of the coordinate in an array.
   */
  static positionToPixel(position, width, height) {
    position /= 4
    let x = position % width
    let y = (position - x) / height
    return [x, y]
  }

  static pixelToPosition(x, y, width) {
    return width * y + x
  }

  /**
   * Use the drawer class to drawSnow the corners and midpoint of this island on the original imageData.
   *
   * @param island
   *        the island to be drawn
   */
  static drawIsland(island, drawer) {
    drawer.drawMid(island)
    drawer.drawCorners(island)
  }

  static findExtremeValues(width, height, img) {
    let points = {
      minx: null,
      maxx: null,
      miny: null,
      maxy: null,
      scale: 1
    }

    let allCorners = []

    img.screens.forEach(function (e) {
      for (let key in e.corners) {
        allCorners.push(e.corners[key])
      }
    })

    //sort on x co
    allCorners.sort(function (a, b) {
      return a[0] - b[0]
    })

    points['minx'] = allCorners[0][0]
    points['maxx'] = allCorners[allCorners.length - 1][0]

    //sort on y co
    allCorners.sort(function (a, b) {
      return a[1] - b[1]
    })

    points['miny'] = allCorners[0][1]
    points['maxy'] = allCorners[allCorners.length - 1][1]

    let scale = (points['maxx'] - points['minx']) / width

    if (height * scale < points['maxy'] - points['miny']) {
      scale = (points['maxy'] - points['miny']) / height
    }

    points['scale'] = scale

    return points
  }

  /**
   * map the the given image size around the found screens
   *
   * @param {int} w image width to display over screens
   * @param {int} h image height to display over screens
   * @param {Image} img Analysed Image Object
   */
  static createPictureCanvas(w, h, img) {
    let pictureCanvas = ImageTools.findExtremeValues(w, h, img)

    w = Math.abs(pictureCanvas.maxx - pictureCanvas.minx)
    h = Math.abs(pictureCanvas.maxy - pictureCanvas.miny)

    return {
      w: w,
      h: h,
      minx: pictureCanvas.minx,
      miny: pictureCanvas.miny,
      maxx: pictureCanvas.maxx,
      maxy: pictureCanvas.maxy,
      scale: pictureCanvas.scale
    }
  }

  static showTransformatedImage(image, canvas) {
    let info = ImageTools.createPictureCanvas(image.width, image.height, image)

    let ratio = Math.max(info.w / image.width, info.h / image.height)

    let transformatedStyles = []
    for (let i = 0; i < this.screens.length; i++) {
      let h = this.screens[i].cssMatrix
      let t =
        'position: absolute; left:' +
        info.minx +
        'px; top: ' +
        info.miny +
        'px; transform: matrix3d(' +
        h.join(', ') +
        '); transform-origin: ' +
        -info.minx +
        'px ' +
        -info.miny +
        'px; width: ' +
        info.w +
        'px; height: ' +
        info.h +
        'px;'

      transformatedStyles.push(t)
    }

    if (canvas !== null) {
      for (let i = 0; i < transformatedStyles.length; i++) {
        let outputCanvas = document.getElementById('output' + (i + 1))
        outputCanvas.style = transformatedStyles[i]
        let outputContext = outputCanvas.getContext('2d')
        outputCanvas.width = info.w
        outputCanvas.height = info.h
        outputContext.drawImage(
          image,
          0,
          0,
          Math.round(image.width * ratio),
          Math.round(image.height * ratio)
        )
      }
    }
  }

  /**
   * Clone an ImageData Object
   * @param src
   *        Source ImageData object
   * @returns {ImageData}
   *        Copy of given ImageData object
   */
  static copyImageData(src) {
    return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height)
  }

}