var screen = {
  width: 1920,
  height: 1080
}

let imgElement = document.createElement('img');
imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener(
  'change',
  e => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
  },
  false
);
imgElement.onload = function () {
  let resizedImage = Image.resizeImage(imgElement, [1920, 1080]);
  let inputCanvas = document.getElementById('inputImage');
  let inputContext = inputCanvas.getContext('2d');
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = resizedImage.width;
  inputCanvas.height = resizedImage.height;
  inputContext.drawImage(resizedImage, 0, 0, resizedImage.width, resizedImage.height);
  let inputImgData = inputContext.getImageData(0, 0, resizedImage.width, resizedImage.height);
  let imageTest = new Image(inputImgData, 'inputImage', 'RGBA',
    [{ size: { width: screen.width, height: screen.height } }, { size: { width: screen.width, height: screen.height } }, { size: { width: screen.width, height: screen.height } }]
  );

  let transImage = document.createElement('img');
  transImage = document.getElementById('transImg');
  let [boxWidth, boxHeight] = imageTest.createPictureCanvas(transImage.width, transImage.height)
  console.log(boxWidth, boxHeight)

  let outputCanvas = document.getElementById('output')
  let outputContext = outputCanvas.getContext('2d')
  outputCanvas.width = boxWidth
  outputCanvas.height = boxHeight
  outputContext.drawImage(transImage, 0, 0, outputCanvas.width, outputCanvas.height)

  let extremeValues = imageTest.findExtremeValues()

  let h = imageTest.screens[0].cssMatrix
  let h2 = imageTest.screens[1].cssMatrix
  // let h3 = imageTest.screens[2].cssMatrix
  let t = "transform: matrix3d(" + h.join(", ") + "); object-fit: none; position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px;" +
    "transform-style: preserve-3d; perspective: none; perspective-origin:center center;";
  let t2 = "transform: matrix3d(" + h2.join(", ") + "); object-fit: none; position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px;" +
    "transform-style: preserve-3d; perspective: none; perspective-origin:center center;";
  //let t3 = "transform: matrix3d(" + h3.join(", ") + ")" object-fit: none; position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px;" +
  // "transform-style: preserve-3d; perspective: none; perspective-origin:center center;";

  let outputCanvas2 = document.getElementById("output2")
  outputCanvas2.style = t
  let outputContext2 = outputCanvas2.getContext("2d")
  outputCanvas2.width = outputCanvas.width
  outputCanvas2.height = outputCanvas.height
  outputContext2.drawImage(outputCanvas, 0, 0, outputCanvas2.width, outputCanvas2.height)

  let outputCanvas3 = document.getElementById("output3")
  outputCanvas3.style = t2
  let outputContext3 = outputCanvas3.getContext("2d")
  outputCanvas3.width = outputCanvas.width
  outputCanvas3.height = outputCanvas.height
  outputContext3.drawImage(outputCanvas, 0, 0, outputCanvas3.width, outputCanvas3.height)

  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show();
};
