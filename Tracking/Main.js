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

  let inputImgData = resizeImageData(inputContext.getImageData(0, 0, imgElement.width, imgElement.height));
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = inputImgData.width;
  inputCanvas.height = inputImgData.height;
  inputContext.putImageData(inputImgData, 0, 0);

  let points = FASTDetector(inputImgData.data, inputImgData.width)
  console.log(points)
  let drawer = new Drawer(inputImgData.data, inputImgData.width, inputImgData.height, inputContext)
  for (let point in points) {
    drawer.drawPoint(points[point][0],points[point][1],2)
  }
};

function resizeImageData(imgData) {
  let border = [1920,1080];
  let scaleWidth = border[0] / imgData.width
  let scaleHeight = border[1] / imgData.height
  let scale = Math.min(scaleWidth, scaleHeight)

  if (scale >= 1) {
    return imgData
  }

  let canvas = document.createElement('canvas')
  canvas.width = imgData.width * scale
  canvas.height = imgData.height * scale
  let ctx = canvas.getContext('2d')

  let copyCanvas = document.createElement('canvas')
  copyCanvas.width = imgData.width
  copyCanvas.height = imgData.height
  let copyCtx = copyCanvas.getContext('2d')
  copyCtx.putImageData(imgData, 0, 0)

  ctx.drawImage(copyCanvas, 0, 0, canvas.width, canvas.height)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}