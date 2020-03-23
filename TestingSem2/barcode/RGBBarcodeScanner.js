class RGBBarcodeScanner {
  //The imageObject must be a copy bcs it will be changed!!!!.
  static scan(imageObjectOrig, LU, RU) {
    let imageData = new ImageData(
        new Uint8ClampedArray(imageObjectOrig.data),
        imageObjectOrig.width,
        imageObjectOrig.height
    );
    console.log(imageData);
    let spectrum = this.channelAvgs(imageData.data)
    this.noiseFilter(imageData, LU, RU, spectrum) ;//the effective imageData.data will be changed!!!!!.
    let maskedCanvas = document.getElementById("masked")
    maskedCanvas.width = imageData.width
    maskedCanvas.height = imageData.height
    let maskedContext = maskedCanvas.getContext("2d")
    maskedContext.putImageData(imageData, 0, 0)
    console.log("filtered")
    console.log(imageData);
    return this.scanHorizontal(imageData, LU, RU)
  }

  static scanHorizontal(imageObject, LU, RU) {
    let pixels = imageObject.data;
    let barcodes = {}
    let scanned = []

    let iterator = new Iterator(
        LU,
        RU,
        imageObject.width,
        imageObject.height
    );

    let greyScan = false;
    let current = iterator.next()

    while (iterator.hasNext()) {
      let i = this.pixelToIndex(current, imageObject.width)
      let value = pixels[i];

      if (!greyScan) {
        if (value === 128) {
          greyScan = true;
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
            if (scanned[scanned.length-1] !== value/255) {
              scanned.push(value/255)
            }
        }
      } else if (value !== 128) {
        scanned.push(value/255);  // set to ones and zeros
        greyScan = false
      }
      current = iterator.next()
    }
    let highest = this.getHighestCode(barcodes)
    let values = Object.keys(barcodes).map(function(key){
      return barcodes[key];
    });
    let totalScanned = values.reduce((a,b) => a + b, 0)
    console.log(barcodes[highest])
    console.log(barcodes[highest]/totalScanned)
    console.log(barcodes)
    return highest
  }

  static distance(first, second) {
    return Math.sqrt((second[0]-first[0])**2 + (second[1]-first[1])**2 + (second[2]-first[2])**2 )
  }

  static getMax(pixels) {
    let black  = [0,0,0]
    let white = [255,255,255]
    let closestBlack = [255,255,255]
    let closestWhite = [0,0,0]
    for (let i = 0; i < pixels.length; i += 4) {
      let R = pixels[i]
      let G = pixels[i+1]
      let B = pixels[i+2]
      let pixel = [R, G, B]
      if (this.distance(pixel, white) < this.distance(closestWhite, white)) {
        closestWhite = pixel;
      }
      if (this.distance(pixel, black) < this.distance(closestBlack, black)) {
        closestBlack = pixel;
      }
    }
    console.log(closestWhite, closestBlack)
    return [closestBlack, closestWhite]
  }

  //spectrum = [[R/pixelNb, G/pixelNb, B/pixelNb], closestWhite, closestBlack]
  static noiseFilter(imageDataOrig, LU, RU, spectrum) {
    let imageData = new ImageData(
        new Uint8ClampedArray(imageDataOrig.data),
        imageDataOrig.width,
        imageDataOrig.height
    )
    let iterator = new Iterator(LU, RU, imageData.width, imageData.height)
    let outputData =  []
    let grey = spectrum[0]
    let distance = Math.round((spectrum[1]-spectrum[2])/2)
    let black = [grey[0]-distance, grey[1]-distance, grey[2]-distance];
    let white = [grey[0]+distance, grey[1]+distance, grey[2]+distance];
    let size = 15;
    let half = Math.floor(size/2);
    let counter = 0;
    let pixel = iterator.next()

    while(iterator.hasNext()) {
      counter++
      let c;
      let blackCounter = 0;
      let whiteCounter = 0;
      let greyCounter = 0;
      let toSearch = [];
      for (let xBox = -half; xBox <= half; xBox++) {
        let y = pixel[1];
        let x = pixel[0] + xBox;
        let pos = this.getMatrix(x, y, imageData);
        if (!toSearch.includes(pos)) {
          toSearch.push(pos);
        }
      }
      for (let j = 0; j < toSearch.length; j++) {
        let pos = toSearch[j];
        let R = imageData.data[pos]
        let G = imageData.data[pos+1]
        let B = imageData.data[pos+2]

        let color = [R, G, B]
        let distanceBlack = this.distance(color, black)
        let distanceWhite = this.distance(color, white)
        let distanceGrey = this.distance(color, grey)

        let correction = Math.min(distanceBlack, distanceWhite, distanceGrey)

        switch (correction) {
          case distanceBlack:
            blackCounter++
            break;

          case distanceWhite:
            whiteCounter++
            break;

          case distanceGrey:
            greyCounter++
            break;
        }
      }

      if (greyCounter > whiteCounter && greyCounter > blackCounter) {
        c = 128
      } else if (whiteCounter > blackCounter) {
        c = 255;
      } else {
        c = 0;
      }
      outputData.push(c,c,c,255)
      pixel = iterator.next()
    }
    console.log(counter)
    imageDataOrig.data.set(Uint8ClampedArray.from(outputData))
  }

  static channelAvgs(pixels) {
    let R = 0;
    let G = 0;
    let B = 0;
    let black  = [0,0,0]
    let white = [255,255,255]
    let closestBlack = [255,255,255]
    let closestWhite = [0,0,0]
    for (let i = 0; i < pixels.length; i += 4) {
      R += pixels[i]
      G += pixels[i+1]
      B += pixels[i+2]
      let pixel = [R, G, B]
      if (this.distance(pixel, white) < this.distance(closestWhite, white)) {
        closestWhite = pixel;
      }
      if (this.distance(pixel, black) < this.distance(closestBlack, black)) {
        closestBlack = pixel;
      }
    }
    let pixelNb = pixels.length/4
    return [[R/pixelNb, G/pixelNb, B/pixelNb], closestWhite.reduce((a,b) => a + b, 0)/3, closestBlack.reduce((a,b) => a + b, 0)/3]
  }

  static calcListAvg(listOf2lists) {
    let avg = []
    avg[0] = (listOf2lists[0][0] + listOf2lists[1][0]) / 2
    avg[1] = (listOf2lists[0][1] + listOf2lists[1][1]) / 2
    avg[2] = (listOf2lists[0][2] + listOf2lists[1][2]) / 2
    return avg
  }
  static getMatrix(x, y, data) {
    if (x < 0) x = 0;
    else if (x > data.width) x = data.width;
    if (y < 0) y = 0;
    else if (y > data.height) y = data.height;
    return this.pixelToIndex([x, y], data.width)
  }

  static positionToPixel(position, data) {
    position = Math.floor(position/4);
    let x = position % data.width;
    let y = Math.floor(position/data.width);
    return [x, y]
  }

  static pixelToIndex(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4
  }

  static getHighestCode(barcodes) {
    return Object.keys(barcodes).reduce((a, b) => barcodes[a] > barcodes[b] ? a : b)
  }
}
