class BarcodeScanner {
  static scan(imageObject, sensitivity) {
    //let width = imageObject.width; // not used
    let height = imageObject.height;
    let image = colorSpace.rgbaToHsla(imageObject.data);

    let scanned = [];
    let barcodes = {};

    for (let i = 0; i < image.length; i += 4) {
      // Hue color values + code: 0/1; 60/2; 120/3; 240/4; 300/5
      let H = image[i] * 2;
      let S = image[i + 1];
      let L = image[i + 2];

      if (S < 10 || L > 70) {
        if (scanned.length === 5) {
          if (barcodes[scanned] === undefined) {
            barcodes[scanned] = 1;
          } else {
            barcodes[scanned] += 1;
          }
        }
        scanned = [];
      } else if (H < sensitivity && S > 50 && !scanned.includes(1)) {
        scanned.push(1);
      } else if (
        H > 60 - sensitivity &&
        H < 60 + sensitivity &&
        S > 50 &&
        !scanned.includes(2)
      ) {
        scanned.push(2);
      } else if (
        H > 120 - sensitivity &&
        H < 120 + sensitivity &&
        S > 50 &&
        !scanned.includes(3)
      ) {
        scanned.push(3);
      } else if (
        H > 240 - sensitivity &&
        H < 240 + sensitivity &&
        S > 50 &&
        !scanned.includes(4)
      ) {
        scanned.push(4);
      } else if (
        H > 300 - sensitivity &&
        H < 300 + sensitivity &&
        S > 50 &&
        !scanned.includes(5)
      ) {
        scanned.push(5);
      }
    }

    let amounts = Object.values(barcodes);
    let maxAmount = Math.max(...amounts);
    let detectedAmount = amounts.reduce((a, b) => a + b, 0);

    let detectRatio = maxAmount / detectedAmount;
    //TODO: Needs to be updated with the right amount of barcodes on screen.
    let ratio = maxAmount / height / 10;
    console.log(detectRatio, ratio);
    if (ratio < 0.1 || detectRatio < 0.5) {
      console.error('Picture is not good enough to detect barcode');
    }

    return parseInt(Object.keys(barcodes).find(key => barcodes[key] === maxAmount).toString().replace(/,/g, ''));
  }

  static scan2(imageObject, sensitivity) {
    let hor = this.scanHorizontal(imageObject, sensitivity)
    let ver = this.scanVertical(imageObject, sensitivity)
    let maxRatio = Math.max(hor[2], ver[2])
    if(hor[2] == maxRatio && maxRatio >= 0){
      return hor[0]
    }else if (maxRatio >= 0) return ver[0]
  }

  static scanHorizontal(imageObject, sensitivity) {
    let height = imageObject.height;
    let image = imageObject.data

    let scanned = [];
    let barcodes = {};

    for (let i = 0; i < image.length; i += 4) {
      // Hue color values + code: 0/1; 60/2; 120/3; 240/4; 300/5
      let H = image[i] * 2;
      let S = image[i + 1];
      let L = image[i + 2];

      if (S < 10 || L > 70) {
        if (scanned.length === 5) {
          if (barcodes[scanned] === undefined) {
            barcodes[scanned] = 1;
          } else {
            barcodes[scanned] += 1;
          }
        }
        scanned = [];
      } else if (H < sensitivity && S > 50 && !scanned.includes(1)) {
        scanned.push(1);
      } else if (
        H > 60 - sensitivity &&
        H < 60 + sensitivity &&
        S > 50 &&
        !scanned.includes(2)
      ) {
        scanned.push(2);
      } else if (
        H > 120 - sensitivity &&
        H < 120 + sensitivity &&
        S > 50 &&
        !scanned.includes(3)
      ) {
        scanned.push(3);
      } else if (
        H > 240 - sensitivity &&
        H < 240 + sensitivity &&
        S > 50 &&
        !scanned.includes(4)
      ) {
        scanned.push(4);
      } else if (
        H > 300 - sensitivity &&
        H < 300 + sensitivity &&
        S > 50 &&
        !scanned.includes(5)
      ) {
        scanned.push(5);
      }
    }
    let amounts = Object.values(barcodes);
    let maxAmount = Math.max(...amounts);
    let detectedAmount = amounts.reduce((a, b) => a + b, 0);

    let detectRatio = maxAmount / detectedAmount;
    //TODO: Needs to be updated with the right amount of barcodes on screen.
    let ratio = maxAmount / height / 10;
    console.log(detectRatio, ratio);
    if (ratio < 0.1 || detectRatio < 0.5) {
      console.log('Picture is not good enough to detect barcode horizontal');
      return [0, 0, 0]
    }else{
    let barcode = parseInt(Object.keys(barcodes).find(key => barcodes[key] === maxAmount).toString().replace(/,/g, ''))
    return [barcode, ratio, detectRatio] 
  }
  }

  static pixelToPosition(pixel, width) {
    return (pixel[1] * width + pixel[0]) * 4;
  }

  static scanVertical(imageObject, sensitivity) {
    let height = imageObject.height;
    let image = imageObject.data

    let scanned = [];
    let barcodes = {};

    for (let x = 0; x < imageObject.width; x++) {
      {
        for (let y = 0; y < imageObject.height; y++) {
          let i = this.pixelToPosition([x, y], imageObject.width)
          // Hue color values + code: 0/1; 60/2; 120/3; 240/4; 300/5
          let H = image[i] * 2;
          let S = image[i + 1];
          let L = image[i + 2];

          if (S < 10 || L > 70) {
            if (scanned.length === 5) {
              if (barcodes[scanned] === undefined) {
                barcodes[scanned] = 1;
              } else {
                barcodes[scanned] += 1;
              }
            }
            scanned = [];
          } else if (H < sensitivity && S > 50 && !scanned.includes(1)) {
            scanned.push(1);
          } else if (
            H > 60 - sensitivity &&
            H < 60 + sensitivity &&
            S > 50 &&
            !scanned.includes(2)
          ) {
            scanned.push(2);
          } else if (
            H > 120 - sensitivity &&
            H < 120 + sensitivity &&
            S > 50 &&
            !scanned.includes(3)
          ) {
            scanned.push(3);
          } else if (
            H > 240 - sensitivity &&
            H < 240 + sensitivity &&
            S > 50 &&
            !scanned.includes(4)
          ) {
            scanned.push(4);
          } else if (
            H > 300 - sensitivity &&
            H < 300 + sensitivity &&
            S > 50 &&
            !scanned.includes(5)
          ) {
            scanned.push(5);
          }
        }
      }
    }
    let amounts = Object.values(barcodes);
    let maxAmount = Math.max(...amounts);
    let detectedAmount = amounts.reduce((a, b) => a + b, 0);

    let detectRatio = maxAmount / detectedAmount;
    //TODO: Needs to be updated with the right amount of barcodes on screen.
    let ratio = maxAmount / height / 10;
    console.log(detectRatio, ratio);
    if (ratio < 0.1 || detectRatio < 0.5) {
      console.log('Picture is not good enough to detect barcode vertical');
      return [0, 0, 0]
    }else{
    let barcode = parseInt(Object.keys(barcodes).find(key => barcodes[key] === maxAmount).toString().replace(/,/g, ''))
    return [barcode, ratio, detectRatio] 
  }
  }
  
}
