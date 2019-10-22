let imgElement = document.createElement("img");
imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
imgElement.onload = function() {
  let maxAmountBorderPx = 1000;
  if (imgElement.width + imgElement.height > maxAmountBorderPx) { 
    let ratio = imgElement.width / imgElement.height;
    imgElement.height = Math.round(maxAmountBorderPx / (ratio + 1.0));
    imgElement.width = Math.round(ratio * imgElement.height);
  }
  let inputCanvas = document.getElementById("inputImage");
  let inputContext = inputCanvas.getContext("2d");
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = imgElement.width;
  inputCanvas.height = imgElement.height;
  inputContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height);
  let inputImgData = inputContext.getImageData(0, 0, imgElement.width, imgElement.height);
  let image = rgbaToHsla(inputImgData.data);
  let barcode = scanner(image, inputImgData.width, inputImgData.height, 15);
  console.log(barcode);
};
