class RGBBarcodeScanner {
  //The imageObject must be a copy bcs it will be changed!!!!.
  static scan(imageObjectOrig, LU, RU) {
    let imageData = new ImageData(
        new Uint8ClampedArray(imageObjectOrig.data),
        imageObjectOrig.width,
        imageObjectOrig.height
    )
    let iterator = new PixelIterator(
        LU,
        RU,
        imageData.width,
        imageData.height
    )

    let barcodes = {}
    let row = iterator.nextRow()
    let spectrum = this.channelAvg(imageData.data)
    while (iterator.hasNextRow()) {
      let row = iterator.nextRow()
      let filteredRow = this.noiseFilter(imageData, row, spectrum)
      barcodes = this.scanRow(filteredRow, barcodes)
    }
    let highest = this.getHighestCode(barcodes)
    let values = Object.keys(barcodes).map(function(key) {
      return barcodes[key]
    })
    let totalScanned = values.reduce((a, b) => a + b, 0)
    console.log(barcodes[highest] / totalScanned)
    console.log(barcodes)
    return highest
  }

  static scanRow(pixels, barcodes) {
    let scanned = []
    let greyScan = false

    for (let value of pixels) {
      if (!greyScan) {
        if (value === 128) {
          greyScan = true
          if (scanned.length > 0) {
            if (scanned.length > 1) {
              let code = (scanned.length - 1) * 2
              if (scanned[0] === 1) {
                code -= 2
              } else {
                code--
              }
              if (code in barcodes) {
                barcodes[code]++
              } else {
                barcodes[code] = 1
              }
            }
            scanned = []
          }
        } else if (scanned.length > 0) {
          if (scanned[scanned.length - 1] !== value / 255) {
            scanned.push(value / 255)
          }
        }
      } else if (value !== 128) {
        scanned.push(value / 255) // set to ones and zeros
        greyScan = false
      }
    }
    return barcodes
  }

  static distance(first, second) {
    return Math.sqrt(
        (second[0] - first[0]) ** 2 +
        (second[1] - first[1]) ** 2 +
        (second[2] - first[2]) ** 2
    )
  }

  //spectrum = [[R/pixelNb, G/pixelNb, B/pixelNb], closestWhite, closestBlack]
  static noiseFilter(imgData, row, spectrum) {
    let pixels = imgData.data
    let grey = spectrum[0]
    let distance = Math.round((spectrum[1] - spectrum[2]) / 2)
    let black = [grey[0] - distance, grey[1] - distance, grey[2] - distance]
    let white = [grey[0] + distance, grey[1] + distance, grey[2] + distance]
    let kSize = 15
    let half = Math.floor(kSize / 2)
    let filteredRow = []

    for (let i = 0; i < row.length; i++) {
      let c
      let blackCounter = 0
      let whiteCounter = 0
      let greyCounter = 0
      let toSearch = []
      for (let rowKernel = -half; rowKernel <= half; rowKernel++) {
        let rowPos = this.getRow(i, rowKernel, row)
        if (!toSearch.includes(row[rowPos])) {
          toSearch.push(row[rowPos])  //per pixel van de rij alle pixels die binnen kernel va
        }
      }
      for (let pixel of toSearch) {
        let dataIndex = this.getMatrix(pixel[0], pixel[1], imgData)
        let R = pixels[dataIndex]
        let G = pixels[dataIndex + 1]
        let B = pixels[dataIndex + 2]

        let color = [R, G, B]
        let distanceBlack = this.distance(color, black)
        let distanceWhite = this.distance(color, white)
        let distanceGrey = this.distance(color, grey)

        let correction = Math.min(distanceBlack, distanceWhite, distanceGrey)

        switch (correction) {
          case distanceBlack:
            blackCounter++
            break
          case distanceWhite:
            whiteCounter++
            break
          case distanceGrey:
            greyCounter++
            break
        }
      }
      if (greyCounter > whiteCounter && greyCounter > blackCounter) {
        c = 128
      } else if (whiteCounter > blackCounter) {
        c = 255
      } else {
        c = 0
      }
      filteredRow.push(c)
    }
    return filteredRow
  }

  static channelAvg(pixels) {
    let R = 0
    let G = 0
    let B = 0
    let black = [0, 0, 0]
    let white = [255, 255, 255]
    let closestBlack = [255, 255, 255]
    let closestWhite = [0, 0, 0]
    for (let i = 0; i < pixels.length; i += 4) {
      R += pixels[i]
      G += pixels[i + 1]
      B += pixels[i + 2]
      let pixel = [pixels[i], pixels[i+1], pixels[i+2]]
      if (this.distance(pixel, white) < this.distance(closestWhite, white)) {
        closestWhite = pixel
      }
      if (this.distance(pixel, black) < this.distance(closestBlack, black)) {
        closestBlack = pixel
      }
    }
    let pixelNb = pixels.length / 4
    return [
      [R / pixelNb, G / pixelNb, B / pixelNb],
      closestWhite.reduce((a, b) => a + b, 0) / 3,
      closestBlack.reduce((a, b) => a + b, 0) / 3
    ]
  }

  static getRow(index, offset, row) {
    let pos = index + offset
    if (0 <= pos && pos < row.length) {
      return pos
    } else return index
  }

  static getMatrix(x, y, data) {
    if (x < 0) x = 0
    else if (x > data.width) x = data.width
    if (y < 0) y = 0
    else if (y > data.height) y = data.height
    return this.pixelToIndex([x, y], data.width)
  }

  static pixelToIndex(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4
  }

  static getHighestCode(barcodes) {
    return Object.keys(barcodes).reduce((a, b) =>
        barcodes[a] > barcodes[b] ? a : b
    )
  }
}
