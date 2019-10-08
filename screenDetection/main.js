let imgElement = document.createElement("img");
imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
imgElement.onload = function() {
    /*let image = cv.imread(imgElement);
    image = rescale(image);
    screenDetection(image);*/
    let inputCanvas = document.getElementById("inputImage");
    let inputContext = inputCanvas.getContext("2d");
    inputCanvas.width = imgElement.width;
    inputCanvas.height = imgElement.height;
    inputContext.drawImage(imgElement, 0, 0);
    inputImgData = inputContext.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
    var inputImage = new Image(inputImgData, "inputImage", "RGBA");
    inputImage.rgbaToHsla();
    var imageOutGreen = new Image(inputImage.getImgData(), "imageOutGreen", "HSLA");
    imageOutGreen.createGreenMask();
    var imageOutBlue = new Image(inputImage.getImgData(), "imageOutBlue", "HSLA");
    imageOutBlue.createBlueMask();
    var imageOutConcatenated = new Image(imageOutGreen.getImgData(), "imageOutConcatenated", "HSLA");
    imageOutConcatenated.addImgData(imageOutBlue.getImgData());
    imageOutGreen.hslaToRgba();
    imageOutGreen.show();
    imageOutBlue.hslaToRgba();
    imageOutBlue.show();
    imageOutConcatenated.hslaToRgba();
    imageOutConcatenated.show();
    console.log("end main");
};
