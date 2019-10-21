const sourceFolder = '/Images/'

/*
['image name', nb screens, [screen size], [orientation screen]]
*/
var images = [
  ['orientation1', 1, [400000], [0]], //0
  ['orientation2', 1, [400000], [90]],
  ['orientation3', 1, [400000], [180]],
  ['orientation4', 1, [400000], [270]],
  ['orientation5', 1, [400000], [45]],
  ['orientation6', 1, [400000], [6.5]],
  ['orientation7', 1, [400000], [347]], // 6
  ['size1', 1, [900], [0]], // 7
  ['size2', 1, [480000], [0]],
  ['size3', 1, [60000], [0]],
  ['size4', 1, [1000000], [0]],
  ['multiple1', 2, [225150], [0]],
  ['multiple2', 10, [40000], [0]],
]

function checkScreenCreation(i){
  if (i < images.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + images[i][0] + '.jpg')
    image.onload = function() {
      ctx = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, image.width, image.height)
      let imgData = ctx.getImageData(0, 0, image.width, image.height)
      var inputImage = new Image(imgData, '', 'RGBA', image.width, image.height)

      inputImage.rgbaToHsla();
      inputImage.createGreenBlueMask();
      inputImage.medianBlurMatrix(3);
      inputImage.createScreens();

      //TODO: creation checker
      //TODO: transfering, mask, creation of screens, id...

      checkScreenCreation(i + 1)
    }
  }
}

function checkNbScreens(i){
  if (i==0) console.log("Start nb screens check")
  if (i < images.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + images[i][0] + '.jpg')
    image.onload = function() {
      ctx = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, image.width, image.height)
      let imgData = ctx.getImageData(0, 0, image.width, image.height)
      var inputImage = new Image(imgData, '', 'RGBA', image.width, image.height)

      inputImage.rgbaToHsla();
      inputImage.createGreenBlueMask();
      inputImage.medianBlurMatrix(3);
      inputImage.createScreens();

      try {
        console.assert(inputImage.screens.length == images[i][1]);
      } catch (error) {
        console.log("Nb screens in " + images[i][0] + " has to be " + images[i][1] + " but returns " + inputImage.screens.length);
      }
      

      checkNbScreens(i + 1)
    }
  } else console.log("Stop nb screens check")
}

function checkSize(i){
  if (i==0) console.log("Start size check")
  if (i < images.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + images[i][0] + '.jpg')
    image.onload = function() {
      ctx = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, image.width, image.height)
      let imgData = ctx.getImageData(0, 0, image.width, image.height)
      var inputImage = new Image(imgData, '', 'RGBA', image.width, image.height)

      inputImage.rgbaToHsla();
      inputImage.createGreenBlueMask();
      inputImage.medianBlurMatrix(3);
      inputImage.createScreens();

      for(let j = 0; j < inputImage.screens.length; j++){ //grootte schermen
        var min = Infinity;
        for(let k = 0; k < images[i][2].length; k++){
          min = Math.min(min, Math.abs(inputImage.screens[j].size - images[i][2][k]))
        }
        try {
          console.assert(min < 5000);
        } catch (error) {
          console.log("Screen size in " + images[i][0] + " has to be one of (look below) but returns " + inputImage.screens[j].size);
          console.log(images[i][2]);
        }
        
      }

      checkSize(i + 1)
    }
  } else  console.log("Stop size check")
}


function checkOrientation(i) {
  if(i == 0) console.log("Start orientation check")
  if (i < images.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + images[i][0] + '.jpg')
    image.onload = function() {
      ctx = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, image.width, image.height)
      let imgData = ctx.getImageData(0, 0, image.width, image.height)
      var inputImage = new Image(imgData, '', 'RGBA', image.width, image.height)

      inputImage.rgbaToHsla();
      inputImage.createGreenBlueMask();
      inputImage.medianBlurMatrix(3);
      inputImage.createScreens();

      for(let j = 0; j < inputImage.screens.length; j++){ //orientatie schermen
        var min = 360;
        for(let k = 0; k < images[i][3].length; k++){
          min = Math.min(min, Math.abs(inputImage.screens[j].orientation - images[i][3][k]))
        }
        try {
          console.assert(min < 2);
        } catch (error) {
          console.log("Screen orientation in " + images[i][0] + " has to be one of (look below) but returns " + inputImage.screens[j].orientation);
          console.log(images[i][3]);
        }
        
      }



      checkOrientation(i + 1)
    }
  } else   console.log("Stop orientation check")
}


function runAllTests() {
  console.log("----------Start tests----------")
  checkNbScreens(0)
  checkSize(0)
  checkOrientation(0);

}
