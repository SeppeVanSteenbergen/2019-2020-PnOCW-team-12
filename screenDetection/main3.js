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
  let maxAmountBorderPx = 2000;
  if (imgElement.width + imgElement.height > maxAmountBorderPx) {
    let ratio = imgElement.width / imgElement.height;
    imgElement.height = Math.round(maxAmountBorderPx / (ratio + 1.0));
    imgElement.width = Math.round(ratio * imgElement.height);
  }
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
  window.inp = inputImgData;
  /*var inputImage = new Image(inputImgData, 'inputImage', 'RGBA');
  inputImage.rgbaToHsla();
  var imageTest = new Image(
    inputImage.getImgData(),
    'remapped',
    'HSLA',
    imgElement.width,
    imgElement.height
  );*/
  //let data = imageTest.getImgData().data;
  //console.log(data);
  let corners = [[268, 299], [607, 300], [610, 469], [268, 472]];
  let newImg = (new Screen(corners, 0, 0)).map(
    inputImgData.data,
    corners,
    inputImgData.width,
    inputImgData.height
  );

  //let newImg = document.createElement('canvas').getContext('2d').createImageData(250,250);
  //newImg.data = newData;

  console.log(newImg);

  let canvOut = document.getElementById('output');
  canvOut.width = newImg.width;
  canvOut.height = newImg.height;
  let ctxOut = canvOut.getContext('2d');
  ctxOut.putImageData(newImg, 0, 0);

  /*console.log(imageTest.pixels);
  imageTest.hslaToRgba();
  imageTest.show();*/
};
