let imgElement = document.createElement("img");
imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
imgElement.onload = function() {
  let maxAmountBorderPx = 1000;
  if (imgElement.width + imgElement.height > maxAmountBorderPx) { 
    let ratio = imgElement.width / imgElement.height;
    imgElement.height = Math.round(maxAmountBorderPx / (ratio + 1.0));
    imgElement.width = Math.round(ratio * imgElement.height);
  }
  let inputCanvas = document.getElementById("inputImage");
  let inputContext = inputCanvas.getContext("2d");
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = imgElement.width;
  inputCanvas.height = imgElement.height;
  inputContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
  let inputImgData = inputContext.getImageData(0, 0, imgElement.width, imgElement.height);
  // var image = inputImgData.data;
  let image = rgbaToHsla(inputImgData.data);
  scanner(image, inputImgData.width, inputImgData.height, 15);
};

function scanner(image, width, height, sensitivity) {
  //Always searching on the middle line
  let searchHeight = Math.round(height / 2);
  let scanned  = Array();

  for (let i = (searchHeight - 1) * width * 4; i < searchHeight * width  * 4; i += 4) {
    // Hue color values + code: 180/1;288/2;336/3;24/4;72/5
    let H = image[i];
    let S = image[i + 1];
    let L = image[i + 2];

    console.log(H, S, L);

    if (H<180+sensitivity && H>180-sensitivity && !scanned.includes(1)){
      scanned.push(1)
    }
    if (H<288+sensitivity && H>288-sensitivity && !scanned.includes(2)){
      scanned.push(2)
    }
    if (H<336+sensitivity && H>336-sensitivity && !scanned.includes(3)){
      scanned.push(3)
    }
    if (H<24+sensitivity && H>24-sensitivity && !scanned.includes(4)){
      scanned.push(4)
    }
    if (H<72+sensitivity && H>72-sensitivity && !scanned.includes(5)){
      scanned.push(5)
    }
    if (L<100-sensitivity && scanned.length === 5){
      console.log("feest")
      return scanned;
    }

  }
  console.log(scanned)

}

function rgbaToHsla(image) {
  for (let i = 0; i < image.length; i += 4) {
    //convert rgb spectrum to 0-1
    let red = image[i] / 255.0;
    let green = image[i + 1] / 255.0;
    let blue = image[i + 2] / 255.0;

    let min = Math.min(red, green, blue);
    let max = Math.max(red, green, blue);
    let L = (min + max) / 2;
    let H = this.findHue(red, green, blue, max, min);
    image[i] = H < 0 ? H + 360 : H;
    image[i + 1] = this.findSaturation(min, max, L)*100;
    image[i + 2] = L*100;
  }
  return image
}

function findHue(red, green, blue, max, min) {
  let hue = 0;
  if (max === min) {
    return 0;
  }
  else if (red === max) {
    hue = (green - blue) / (max - min);
  }
  else if (green === max) {
    hue = 2.0 + (blue - red) / (max - min);
  }
  else if (blue === max) {
    hue = 4.0 + (red - green) / (max - min);
  }

  return hue*60;
}

function findSaturation(min, max, L) {
  if (max-min === 0) {
    return 0;
  } else {
    return (max - min) / (1.0 - Math.abs(2*L-1.0));
  }
}



//old

// function rgbaToHsla(image) {
//   for (let i = 0; i < image.length; i += 4) {
//       //convert rgb spectrum to 0-1
//       let red = image[i] / 255;
//       let green = image[i + 1] / 255;
//       let blue = image[i + 2] / 255;
//
//       let min = Math.min(red, green, blue);
//       let max = Math.max(red, green, blue);
//
//       let L = (min + max) / 2;
//       let S = findSaturation(min, max, L);
//       let H = findHue(red, green, blue, max, min);
//
//       image[i] = H;
//       image[i + 1] = Math.round(S * 100);
//       image[i + 2] = Math.round(L * 100);
//   }
//
//   return image;
// }
//
// function findSaturation(min, max, L) {
//   if (L < 0.5) {
//       return (max - min) / (max + min);
//   } else {
//       return (max - min) / (2.0 - max - min);
//   };
// }
//
// function findHue(red, green, blue, max, min) {
//   let hue = 0;
//   if (max == min) {
//       return 0;
//   }
//   else if (red == max) {
//       hue = (green - blue) / (max - min);
//   }
//   else if (green == max) {
//       hue = 2.0 + (blue - red) / (max - min);
//   }
//   else if (blue == max) {
//       hue = 4.0 + (red - green) / (max - min);
//   }
//
//   hue *= 60;
//   if (hue < 0) {
//       hue += 360
//   }
//   return hue;
// }
