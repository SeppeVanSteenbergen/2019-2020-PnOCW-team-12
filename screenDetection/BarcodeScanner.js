class BarcodeScanner {
  static scan(imageObject, sensitivity) {
    //let width = imageObject.width; // not used
    let height = imageObject.height;
    let image = this.rgbaToHsla(imageObject.data);

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
      return null;
    }

    return parseInt(Object.keys(barcodes).find(key => barcodes[key] === maxAmount).toString().replace(/,/g, ''));
  }

  static rgbaToHsla(image) {
    for (let i = 0; i < image.length; i += 4) {
      //convert rgb spectrum to 0-1
      let red = image[i] / 255;
      let green = image[i + 1] / 255;
      let blue = image[i + 2] / 255;

      let min = Math.min(red, green, blue);
      let max = Math.max(red, green, blue);

      let L = (min + max) / 2;
      let S = this.findSaturation(min, max, L);
      let H = this.findHue(red, green, blue, max, min);

      image[i] = H / 2;
      image[i + 1] = Math.round(S * 100);
      image[i + 2] = Math.round(L * 100);
    }

    return image;
  }

  static findSaturation(min, max, L) {
    if (L < 0.5) {
      if (min + max === 0) {
        return 0;
      }
      return (max - min) / (max + min);
    } else {
      return (max - min) / (2.0 - max - min);
    }
  }

  static findHue(red, green, blue, max, min) {
    let hue = 0;
    if (max === min) {
      return 0;
    } else if (red === max) {
      hue = (green - blue) / (max - min);
    } else if (green === max) {
      hue = 2.0 + (blue - red) / (max - min);
    } else if (blue === max) {
      hue = 4.0 + (red - green) / (max - min);
    }

    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
    return hue;
  }
}
