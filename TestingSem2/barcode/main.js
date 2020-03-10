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