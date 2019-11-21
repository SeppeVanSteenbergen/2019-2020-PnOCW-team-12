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
  let inputCanvas = document.getElementById('inputImage');
  let inputContext = inputCanvas.getContext('2d');
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = imgElement.width;
  inputCanvas.height = imgElement.height;
  inputContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
  let inputImgData = inputContext.getImageData(
    0,
    0,
    imgElement.width,
    imgElement.height
  );
  let imageTest = new Image(
    inputImgData,
    'imageOutConcatenated',
    'RGBA',
    null
  );  
  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show();
};
