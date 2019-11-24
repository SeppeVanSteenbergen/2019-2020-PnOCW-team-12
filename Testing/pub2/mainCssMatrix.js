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

  let extremeValues = imageTest.findExtremeValues()

  let h = imageTest.screens[0].cssMatrix
  // let h2 = imageTest.screens[1].cssMatrix
  // let h3 = imageTest.screens[2].cssMatrix
  let t = "position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px; transform: matrix3d(" + h.join(", ") + "); transform-origin: left top; width: " + boxWidth + "px; height: " + boxHeight + "px; object-fit: none";
  // let t2 = "position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px; transform: matrix3d(" + h2.join(", ") + "); transform-origin: left top; width: " + boxWidth + "px; height: " + boxHeight + "px; object-fit: none";
  //let t3 = "position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px; transform: matrix3d(" + h3.join(", ") + "); transform-origin: left top; width: " + boxWidth + "px; height: " + boxHeight + "px; object-fit: none";

  let outputCanvas = document.getElementById('output')
  outputCanvas.style = t
  let outputContext = outputCanvas.getContext('2d')
  outputCanvas.width = boxWidth
  outputCanvas.height = boxHeight
  outputContext.drawImage(transImage, 0, 0, outputCanvas.width, outputCanvas.height)

  // let outputCanvas2 = document.getElementById("output2")
  // outputCanvas2.style = t2
  // let outputContext2 = outputCanvas2.getContext("2d")
  // outputCanvas2.width = boxWidth
  // outputCanvas2.height = boxHeight
  // outputContext2.drawImage(transImage, 0, 0, outputCanvas2.width, outputCanvas2.height)

  // let outputCanvas3 = document.getElementById("output3")
  // outputCanvas3.style = t3
  // let outputContext3 = outputCanvas3.getContext("2d")
  // outputCanvas3.width = boxWidth
  // outputCanvas3.height = boxHeight
  // outputContext3.drawImage(transImage, 0, 0, outputCanvas3.width, outputCanvas3.height)

  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show();
};
