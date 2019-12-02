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
  let c = document.createElement('canvas')
  c.width = imgElement.width
  c.height = imgElement.height
  let ctx = c.getContext('2d')
  ctx.drawImage(imgElement, 0, 0, c.width, c.height)

  let imgData = ctx.getImageData(0, 0, c.width, c.height)
  let imgDataResized = Image.resizeImageData(imgData, [1920, 1080])

  let inputCanvas = document.getElementById('inputImage')
  let inputContext = inputCanvas.getContext('2d')
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height)
  inputCanvas.width = imgDataResized.width
  inputCanvas.height = imgDataResized.height
  inputContext.putImageData(imgDataResized, 0, 0)
  let imageTest = new Image(imgDataResized, 'imageOutConcatenated', 'RGBA', null);
  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show();
};
