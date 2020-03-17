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
  let inputImgData = inputContext.getImageData(0, 0, imgElement.width, imgElement.height);
  let maskedCanvas = document.getElementById("masked")
  maskedCanvas.width = imgElement.width
  maskedCanvas.height = imgElement.height
  let maskedContext = maskedCanvas.getContext("2d")
  let maskedImgData = maskedContext.createImageData(imgElement.width, imgElement.height)
  maskedImgData.data.set(Uint8ClampedArray.from(createMask(inputImgData)))
  maskedContext.putImageData(maskedImgData, 0, 0)
  console.log(maskedImgData)
  let filteredCanvas = document.getElementById("filteredMask")
  filteredCanvas.width = imgElement.width
  filteredCanvas.height = imgElement.height
  let filteredContext = filteredCanvas.getContext("2d")
  let filteredImgData = filteredContext.createImageData(imgElement.width, imgElement.height)
  filteredImgData.data.set(Uint8ClampedArray.from(noiseFilter(maskedImgData)))
  filteredContext.putImageData(filteredImgData,0,0)
};

function createMask(imageData) {
  let outputData =  []
  for (let i = 0; i < imageData.data.length; i += 4) {
    let c
    let R = imageData.data[i]
    let G = imageData.data[i+1]
    let B = imageData.data[i+2]

    let color = [R, G, B]

    let black = [0, 0, 0];
    let white = [255, 255, 255]
    let grey = [128, 128, 128]

    let distanceBlack = distance(color, black)
    let distanceWhite = distance(color, white)
    let distanceGrey = distance(color, grey)

    let correction = Math.min(distanceBlack, distanceWhite, distanceGrey)

    switch (correction) {
      case distanceBlack:
        c = 0;
        break

      case distanceWhite:
        c = 255
        break

      case distanceGrey:
        c = 128
        break
    }
    outputData.push(c,c,c,255)
  }
  return outputData
}

function distance(first, second) {
  return Math.sqrt((second[0]-first[0])**2 + (second[1]-first[1])**2 + (second[2]-first[2])**2 )
}

function noiseFilter(imageData) {
  let outputData =  []
  let black = [0, 0, 0];
  let white = [255, 255, 255]
  let grey = [128, 128, 128]
  let size = 3;
  let half = Math.floor(size/2);
  let divisor = size*size;

  for (let i = 0; i < imageData.data.length; i += 4) {
    let c;
    let pixel = positionToPixel(i, imageData);
    let sum = [0,0,0];
    let toSearch = [];
    for (let yBox = -half; yBox <= half; yBox++) {
      for (let xBox = -half; xBox <= half; xBox++) {
        let y = pixel[1] + yBox;
        let x = pixel[0] + xBox;
        let pos = getMatrix(x, y, imageData);
        if (!toSearch.includes(pos)) {
          toSearch.push(pos);
        }
      }
    }
    for (let j = 0; j < toSearch.length; j++) {
      let pos = toSearch[j];
      sum[0] += imageData.data[pos]
      sum[1] += imageData.data[pos+1]
      sum[2] += imageData.data[pos+2]
    }
    sum[0] = sum[0]/divisor;
    sum[1] = sum[1]/divisor;
    sum[2] = sum[2]/divisor;

    let distanceBlack = distance(sum, black)
    let distanceWhite = distance(sum, white)
    let distanceGrey = distance(sum, grey)

    let correction = Math.min(distanceBlack, distanceWhite, distanceGrey)

    switch (correction) {
      case distanceBlack:
        c = 0;
        break

      case distanceWhite:
        c = 255
        break

      case distanceGrey:
        c = 128
        break
    }
    outputData.push(c,c,c,255)
    //console.log("pixel " + pixel[0] + ", " + pixel[1] + " value of : " + c)
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
  return pixels.width * y + x
}

function positionToPixel(position, data) {
  position = Math.floor(position/4)
  let x = position % data.width
  let y = Math.floor(position/data.width)
  return [x, y]
}