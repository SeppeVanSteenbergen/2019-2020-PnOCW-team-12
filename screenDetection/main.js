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
    var img = new Image(imgElement, "RGBA");
    img.rgbaToHsla();
    img.show();
    alert("HSLA");
    img.hslaToRgba();
    img.show();
    // createGreenMask(img);
    // hslToRgb(img);
    // var canvas = document.getElementById("outputCanvas");
    // var ctx = canvas.getContext("2d");
    // ctx.drawImage(img.canvas, 0, 0);
    // console.log("end main");
};
