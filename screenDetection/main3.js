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

  let corners = [];
  let destination = [];

  function selectPoint(event) {
    // console.log(event.clientX, event.clientY)
    if (corners.length < 4) {
      corners.push([event.clientX, event.clientY]);
      let newPoint = [event.clientX - 7, event.clientY - 7];
      inputContext.beginPath();
      inputContext.fillStyle = '#000';
      inputContext.rect(newPoint[0] - 3.5, newPoint[1] - 3.5, 7, 7);
      inputContext.fill();
      /*} else if (destination.length < 4) {
      destination.push([event.clientX, event.clientY]);
      let newPoint = [event.clientX - 7, event.clientY - 7];
      inputContext.beginPath();
      inputContext.fillStyle = '#00f';
      inputContext.rect(newPoint[0] - 3.5, newPoint[1] - 3.5, 7, 7);
      inputContext.fill();*/
    } else {
      // let corners = [[0,0],[250,50],[250,100],[0,150]]
      // let destination = [[0,0],[250,0],[250,150],[0,150]]
      let outImg = new Screen(corners, 0, 0).map(
        inputImgData,
        corners,
        inputImgData.width,
        inputImgData.height
      );
      let canv = document.getElementById('remapped');
      canv.width = outImg.width;
      canv.height = outImg.height;
      canv.getContext('2d').putImageData(outImg, 0, 0);
    }
  }

  inputCanvas.addEventListener('click', selectPoint);

  // console.log(data)
  // // let corners = [[0,0],[250,50],[250,100],[0,150]]
  // // let destination = [[0,0],[250,0],[250,150],[0,150]]
  // imageTest.pixels = new Screen(corners, 0,0).map(data, corners, destination, 250,150)
  // console.log(imageTest.pixels)
  // imageTest.hslaToRgba()
  // imageTest.show()
};
