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
    'inputImage',
    'RGBA', 
    [{size: {width: 600, height: 300}}, {size: {width: 600, height: 300}}, {size: {width: 600, height: 300}}]
  ); 
  let outputCanvas = document.getElementById('output')
  let outputContext = outputCanvas.getContext('2d')
  //outputContext.clearRect(0, 0, imgElement.width, imgElement.height)
  outputCanvas.width = imgElement.width
  outputCanvas.height =  imgElement.height
  let outputCanvas2 = document.getElementById('output2')
  let outputContext2 = outputCanvas.getContext('2d')
  //outputContext2.clearRect(0, 0, imgElement.width, imgElement.height)
  outputCanvas2.width = imgElement.width
  outputCanvas2.height =  imgElement.height
  // let outputCanvas3 = document.getElementById('output3')
  // let outputContext3 = outputCanvas.getContext('2d')
  // outputContext3.clearRect(0, 0, imgElement.width, imgElement.height)
  // outputCanvas3.width = imgElement.width
  // outputCanvas3.height =  imgElement.height

  let transImage = document.createElement('img');
  transImage = document.getElementById('transImg');
 // let h = imageTest.screens[0].cssTransMatrix(Algebra.inv(imageTest.screens[0].transMatrix))
  let h = imageTest.screens[0].cssMatrix
  let h2 = imageTest.screens[1].cssMatrix
  // let h3 = imageTest.screens[2].cssMatrix
  //console.log(t)
  let t = "transform: matrix3d(" + h.join(", ") + "); object-fit: none; height: 300px; width: 300px; object-position: -30px";
  let t2 = "transform: matrix3d(" + h2.join(", ") + "); object-fit: none; height: 300px; width: 300px; object-position: -30px";
  //let t3 = "transform: matrix3d(" + h3.join(", ") + ")";
  outputCanvas.style = t
  outputContext.drawImage(transImage,0,0, imgElement.width, imgElement.height)

  outputCanvas2.style = t2
  outputContext2.drawImage(transImage,0,0, imgElement.width, imgElement.height)

  // outputCanvas3.style = t3
  // outputContext3.drawImage(transImage,0,0, imgElement.width, imgElement.height)
  
  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show(); 
};
