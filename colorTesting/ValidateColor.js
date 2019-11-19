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
  imgElement.width = 640;
  imgElement.height = 480;
  let inputCanvas = document.getElementById('inputImage');
  let inputContext = inputCanvas.getContext('2d');
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = imgElement.width;
  inputCanvas.height = imgElement.height;
  inputContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
};

function validateColor() {
  var inputCanvas = document.getElementById('inputImage');
  var inputContext = inputCanvas.getContext('2d');
  let inputImgData = inputContext.getImageData(
    0,
    0,
    imgElement.width,
    imgElement.height
  );
  let pixels = ColorSpace.rgbaToHsla(inputImgData.data);

  let color = document.getElementById('color').value;

  try {
    if (color === "colorSelect") throw "Select color before validating!"

    let amount = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      let H = pixels[i] * 2;
      let S = pixels[i + 1];
      let L = pixels[i + 2];

      if (ColorRange.colorDetected(color, H, S, L)) {
        amount++;
      }
    }

    if (amount / pixels.length < 1) {
      alert("Not all pixels are detected as the right color. Send this picture to Seppe");
    }
  } catch (error) {
    alert(error)
  }

};
