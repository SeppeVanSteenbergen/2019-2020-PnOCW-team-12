let imgElement = document.createElement("img");
imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
imgElement.onload = function () {
  /*let image = cv.imread(imgElement);
  image = rescale(image);
  screenDetection(image);*/
  let maxAmountBorderPx = 4000;
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
  inputImgData = inputContext.getImageData(0, 0, imgElement.width, imgElement.height);
  var inputImage = new Image(inputImgData, "inputImage", "RGBA");
  inputImage.rgbaToHsla();
  var imageOutGreen = new Image(inputImage.getImgData(), "imageOutGreen", "HSLA");
  imageOutGreen.createGreenMask();
  var imageOutBlue = new Image(inputImage.getImgData(), "imageOutBlue", "HSLA");
  imageOutBlue.createBlueMask();
  /*
  var imageOutConcatenated = new Image(imageOutGreen.getImgData(), "imageOutConcatenated", "HSLA");
  imageOutConcatenated.addImgData(imageOutBlue.getImgData());
  */
  
  var imageOutConcatenated = new Image(inputImage.getImgData(), "imageOutConcatenated", "HSLA");
  imageOutConcatenated.createGreenBlueMask();
  console.log(imageOutConcatenated.getHeight());
  console.log(imageOutConcatenated.getWidth());
  console.log(imageOutConcatenated.matrix);
  //imageOutConcatenated.detectScreens();
  
  imageOutGreen.hslaToRgba();
  imageOutGreen.show();
  imageOutBlue.hslaToRgba();
  imageOutBlue.show();
  var imageOutSmoothened = new Image(imageOutConcatenated.getImgData(), "imageOutSmoothened", "HSLA");

  imageOutConcatenated.hslaToRgba();
  

  imageOutSmoothened.cornerDetection();
  imageOutConcatenated.medianBlur(7);
  imageOutConcatenated.calcIslands();
  imageOutConcatenated.show();
  imageOutSmoothened.hslaToRgba();
  imageOutSmoothened.show();
};
