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
  let resizedImage = Image.resizeImage(imgElement, [1920, 1080]);
  let inputCanvas = document.getElementById('inputImage');
  let inputContext = inputCanvas.getContext('2d');
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  inputCanvas.width = resizedImage.width;
  inputCanvas.height = resizedImage.height;
  inputContext.drawImage(resizedImage, 0, 0, resizedImage.width, resizedImage.height);
  let inputImgData = inputContext.getImageData(0, 0, resizedImage.width, resizedImage.height);
  let imageTest = new Image(inputImgData, 'inputImage', 'RGBA',
    [{size: {width: screen.width, height: screen.height}}, {size: {width: screen.width, height: screen.height}}, {size: {width: screen.width, height: screen.height}}]
  );

  let transImage = document.createElement('img');
  transImage = document.getElementById('transImg');
  let [boxWidth, boxHeight] = imageTest.createPictureCanvas(transImage.width, transImage.height)
  
  let outputCanvas = document.getElementById('output')
  let outputContext = outputCanvas.getContext('2d')
  outputCanvas.width = boxWidth
  outputCanvas.height =  boxHeight
  outputContext.drawImage(transImage, 0, 0, outputCanvas.width, outputCanvas.height)

  let transImageData = outputContext.getImageData(0, 0, outputCanvas.width, outputCanvas.height)
  
  // let outputCanvas2 = document.getElementById('output2')
  // outputCanvas2.width = 2000
  // outputCanvas2.height = 2000
  //outputContext2.clearRect(0, 0, imgElement.width, imgElement.height)
  // let outputCanvas3 = document.getElementById('output3')
  // let outputContext3 = outputCanvas.getContext('2d')
  // outputContext3.clearRect(0, 0, imgElement.width, imgElement.height)
  // outputCanvas3.width = imgElement.width
  // outputCanvas3.height =  imgElement.height
  
  let h = imageTest.screens[0].cssMatrix
  // let h2 = imageTest.screens[1].cssMatrix
  // let h3 = imageTest.screens[2].cssMatrix
  //console.log(t)
  let t = "transform: matrix3d(" + h.join(", ") + "); object-fit: none;";
  //let t2 = "transform: matrix3d(" + h2.join(", ") + "); object-fit: none; height: 600px; width: 600px";
  //let t3 = "transform: matrix3d(" + h3.join(", ") + ")";

  let outputCanvas2 = document.getElementById("output2")
  outputCanvas2.style = t
  let outputContext2 = outputCanvas2.getContext("2d")
  outputCanvas2.width = screen.width
  outputCanvas2.height =  screen.height
  outputContext2.putImageData(transImageData, 0, 0)
  // outputContext2.drawImage(transImage, 0, 0, outputCanvas2.width, outputCanvas2.height)
  // outputContext.drawImage(transImage,0,0, 1920, 1080)
  // let imgData2 = outputCanvas.getContext('2d').getImageData(0,0,2000,2000)
  // let ctxCanvas2 = outputCanvas2.getContext("2d")
  // ctxCanvas2.putImageData(imgData2, 0, 0)

  // let LU0 = imageTest.screens[0].corners[0]
  // let transformedLU0 = imageTest.screens[0].transform(LU0)

  // console.log(LU0, transformedLU0)

  // outputContext2.getImageData(0, 0, 1920, 1080)

  // let outputCanvas3 = document.getElementById("output3")
  // let outputContext3 = outputCanvas3.getContext("2d")
  // outputCanvas3.width = 1720
  // outputCanvas3.height =  880
  // outputContext3.putImageData(outputContext2.getImageData(0, 0, 1920, 1080), 0, 0)

  


 // outputCanvas2.style = t2
 // outputContext2.drawImage(transImage,0,0, imgElement.width, imgElement.height)

  // outputCanvas3.style = t3
  // outputContext3.drawImage(transImage,0,0, imgElement.width, imgElement.height)
  
  ColorSpace.hslaToRgba(imageTest.pixels);
  imageTest.show(); 
};
