let imgElement = document.createElement("img");
imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
imgElement.onload = function() {
  let inputCanvas = document.getElementById("inputImage");
  let inputContext = inputCanvas.getContext("2d");
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = imgElement.width;
  inputCanvas.height = imgElement.height;
  inputContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
  let inputImgData = resizeImageData(inputContext.getImageData(0, 0, imgElement.width, imgElement.height));
  let maskedCanvas = document.getElementById("masked")
  maskedCanvas.width = inputImgData.width
  maskedCanvas.height = inputImgData.height
  let maskedContext = maskedCanvas.getContext("2d")
  let maskedImgData = maskedContext.createImageData(inputImgData.width, inputImgData.height)
  maskedImgData.data.set(Uint8ClampedArray.from(noiseFilter(inputImgData)))
  maskedContext.putImageData(maskedImgData, 0, 0)
  console.log(maskedImgData)
  let filteredCanvas = document.getElementById("filteredMask")
  filteredCanvas.width = maskedImgData.width
  filteredCanvas.height = maskedImgData.height
  let filteredContext = filteredCanvas.getContext("2d")
  let filteredImgData = filteredContext.createImageData(maskedImgData.width, maskedImgData.height)
  filteredImgData.data.set(Uint8ClampedArray.from(noiseFilter(maskedImgData)))
  filteredContext.putImageData(filteredImgData,0,0)
};

function distance(first, second) {
  return Math.sqrt((second[0]-first[0])**2 + (second[1]-first[1])**2 + (second[2]-first[2])**2 )
}

function noiseFilter(imageDataOrig) {
  let imageData = new ImageData(
      new Uint8ClampedArray(imageDataOrig.data),
      imageDataOrig.width,
      imageDataOrig.height
  )
  let outputData =  []
  let black = [0, 0, 0];
  let white = [255, 255, 255]
  let grey = [128, 128, 128]
  let size = 15;
  let HSize = 4;   //TODO: implement with pixeliterator!!!!!
  let half = Math.floor(size/2);

  for (let i = 0; i < imageData.data.length; i += 4) {
    let c;
    let blackCounter = 0;
    let whiteCounter = 0;
    let greyCounter = 0;
    let pixel = positionToPixel(i, imageData);
    let toSearch = [];
    for (let xBox = -half; xBox <= half; xBox++) {
      let y = pixel[1];
      let x = pixel[0] + xBox;
      let pos = getMatrix(x, y, imageData);
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
      let distanceBlack = distance(color, black)
      let distanceWhite = distance(color, white)
      let distanceGrey = distance(color, grey)

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
  }
  return outputData
}

function getMatrix(x, y, data) {
  if (x < 0) x = 0;
  else if (x > data.width) x = data.width;
  if (y < 0) y = 0;
  else if (y > data.height) y = data.height;
  return pixelToPosition(x, y, data)
}

function pixelToPosition(x, y, pixels) {
  return (pixels.width * y + x)*4
}

function positionToPixel(position, data) {
  position = Math.floor(position/4)
  let x = position % data.width
  let y = Math.floor(position/data.width)
  return [x, y]
}

function resizeImageData(imgData) {
  let border = [1920,1080];
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