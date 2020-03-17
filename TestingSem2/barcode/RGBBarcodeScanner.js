import ColorRange from './ColorRange'
import PixelIterator from './PixelIterator'

class RGBBarcodeScanner {
  //The imageObject must be a copy bcs it will be changed!!!!.
  static scan(imageObjectOrig, LU, RU) {
    let imageData = new ImageData(
        new Uint8ClampedArray(imageObjectOrig.data),
        imageObjectOrig.width,
        imageObjectOrig.height
    );
    this.noiseFilter(imageData) ;//the effective imageData.data will be changed!!!!!.
    let iterator = new PixelIterator(
        LU,
        RU,
        imageData.width,
        imageData.height
    );
    console.log(imageData);
    return this.scanHorizontal(imageData, iterator)
  }

  static scanHorizontal(imageObject, iterator, clients) { //TODO: set to RGB
    let image = imageObject.data;
    let barcodes = {}
    let scanned = 0

    let whiteStart = false;

    let whiteScan = false;
    let blackScan = false;
    let grayScan = false;

    let current = iterator.next();
    while (current !== null) {
      let i = this.pixelToIndex(current, imageObject.width)
      let value = image[i];
      if(grayScan && value !== 128){
        if (value === 255)
          whiteStart = true;
        else
          whiteStart = false;
      }
      if (value === 255 && !whiteScan){
        scanned++
        whiteScan = true;
        blackScan = false;
        grayScan = false;
      } else if (value === 0 && !blackScan){
        scanned++;
        whiteScan = false;
        blackScan = true;
        grayScan = false;
      } else if (value === 128 && !grayScan){
        scanned *= 2;
        if (!whiteStart)
          scanned -= 1
        if (barcodes.has(scanned))
          barcodes[scanned]++
        else
          barcodes[scanned] = 1
      } else {
        switch(value) {
          case 0:
            blackScan = true;
            whiteStart = false;
            break;
          case 128:
            grayScan = true;
            break;
          case 255:
            whiteScan = true;
            whiteStart = true;
            break;
        }

      }

      current = iterator.next()
    }
    console.log(barcodes)
    console.log('scanned')
    let keys = this.calcKeys(barcodes, clients)
    let filteredCode = this.filterBarcode(keys)
    console.log(filteredCode)
    let barcode = filteredCode[0]
    let highestWhite = filteredCode[1]
    let amounts = Object.values(barcodes)
    let maxAmount = Math.max(...amounts)
    let detectedAmount = amounts.reduce((a, b) => a + b, 0)
    let detectRatio = maxAmount / detectedAmount
    barcode *= 2
    if (highestWhite) {
      barcode -= 2
    } else barcode--
    console.log(detectRatio)
    console.log(barcode)
    return barcode
  }

  static calcKeys(dict) {
    let keys = Object.keys(dict)
    let resultKeys = []
    for (let i = 0; i < keys.length; i++) {
      resultKeys.push([
        parseInt(keys[i][0]),
        keys[i].substring(2) === 'true',
        dict[keys[i]]
      ])

    }
    return resultKeys
  }

  static filterBarcode(list) {
    let length = list.length
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length - i - 1; j++) {
        if (list[j][2] < list[j + 1][2]) {
          let tmp = list[j + 1]
          list[j + 1] = list[j]
          list[j] = tmp
        }
      }
    }
    console.log(list)
    return list[0]
  }

  static distance(first, second) {
    return Math.sqrt((second[0]-first[0])**2 + (second[1]-first[1])**2 + (second[2]-first[2])**2 )
  }

  static noiseFilter(imageDataOrig) {
    let imageData = new ImageData(
        new Uint8ClampedArray(imageDataOrig.data),
        imageDataOrig.width,
        imageDataOrig.height
    );
    let outputData =  [];
    let black = [0, 0, 0];
    let white = [255, 255, 255];
    let grey = [128, 128, 128];
    let size = 7;
    let half = Math.floor(size/2);

    for (let i = 0; i < imageData.data.length; i += 4) {
      let c;
      let blackCounter = 0;
      let whiteCounter = 0;
      let greyCounter = 0;
      let pixel = this.positionToPixel(i, imageData);
      let toSearch = [];
      for (let yBox = -half; yBox <= half; yBox++) {
        for (let xBox = -half; xBox <= half; xBox++) {
          let y = pixel[1] + yBox;
          let x = pixel[0] + xBox;
          let pos = this.getMatrix(x, y, imageData);
          if (!toSearch.includes(pos)) {
            toSearch.push(pos);
          }
        }
      }
      for (let j = 0; j < toSearch.length; j++) {
        let pos = toSearch[j];
        let R = imageData.data[pos];
        let G = imageData.data[pos+1];
        let B = imageData.data[pos+2];

        let color = [R, G, B];
        let distanceBlack = this.distance(color, black);
        let distanceWhite = this.distance(color, white);
        let distanceGrey = this.distance(color, grey);

        let correction = Math.min(distanceBlack, distanceWhite, distanceGrey);

        switch (correction) {
          case distanceBlack:
            blackCounter++;
            break;

          case distanceWhite:
            whiteCounter++;
            break;

          case distanceGrey:
            greyCounter++;
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
    }
    imageDataOrig.data.set(Uint8ClampedArray.from(outputData))
  }

  static getMatrix(x, y, data) {
    if (x < 0) x = 0;
    else if (x > data.width) x = data.width;
    if (y < 0) y = 0;
    else if (y > data.height) y = data.height;
    return pixelToPosition(x, y, data)
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
}
