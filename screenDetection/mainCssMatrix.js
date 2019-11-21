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
  // let maxAmountBorderPx = 2000;
  // if (imgElement.width + imgElement.height > maxAmountBorderPx) {
  //   let ratio = imgElement.width / imgElement.height;
  //   imgElement.height = Math.round(maxAmountBorderPx / (ratio + 1.0));
  //   imgElement.width = Math.round(ratio * imgElement.height);
  // }
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
    'inputImage',
    'RGBA',
    imgElement.width,
    imgElement.height,
    [{size: {width: 600, height: 600}}]
  ); 
  let outputCanvas = document.getElementById('output')
  let outputContext = outputCanvas.getContext('2d')
  outputContext.clearRect(0, 0, imgElement.width, imgElement.height)
  outputCanvas.width = imgElement.width
  outputCanvas.height =  imgElement.height
  

  t = imageTest.screens[0].transMatrix
  
  t = [t[0][0], t[1][0], 0, t[2][0],
  t[0][1], t[1][1], 0, t[2][1],
  0   , 0   , 1, 0   ,  
  t[0][2], t[1][2], 0, t[2][2]]

  console.log(t)
  t = "perspective: none; transform: matrix3d(" + t.join(", ") + ")";
  outputCanvas.style = t
  outputContext.drawImage(imgElement, 0, 0, imgElement.width, imgElement.height)

  
  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show(); 
};
