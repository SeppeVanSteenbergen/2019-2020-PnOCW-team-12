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
  let imageTest = new Image(
    inputImgData,
    'imageOutConcatenated',
    'RGBA',
    imgElement.width,
    imgElement.height,
    {
      68: {
        size: {
          width: 1000,
          height: 700
        }
      },
      67: {
        size: {
          width: 1000,
          height: 700
        }
      }
    }
  );
  imageTest.rgbaToHsla();

  /*let imageTest = new Image(
    inputImage.getImgData(),
    'imageOutConcatenated',
    'HSLA',
    imgElement.width,
    imgElement.height,
    null
  );*/
  imageTest.createBigMask();
  imageTest.medianBlurMatrix(3);
  imageTest.medianBlur(3);
  imageTest.createOffset(3);
  imageTest.createScreens();
  imageTest.hslaToRgba();
  imageTest.show();
};
