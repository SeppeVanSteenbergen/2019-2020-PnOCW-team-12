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
imgElement.onload = function() {
  // Resize image to max full HD resolution
  inputImgData = Image.resizeImage(imgElement, [1920, 1080])
  let inputCanvas = document.getElementById('inputImage');
  let inputContext = inputCanvas.getContext('2d');
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = inputImgData.width;
  inputCanvas.height = inputImgData.height;
  inputContext.putImageData(inputImgData, 0, 0);
  let imageTest = new Image(
    inputImgData,
    'imageOutConcatenated',
    'RGBA',
    null
  );
  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show();
};
