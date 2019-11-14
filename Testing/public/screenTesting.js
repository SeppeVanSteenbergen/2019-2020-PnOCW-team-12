/*
['image name', nb screens, [screen size], [orientation screen]]
*/
let screenImages = [
  ['orientation1', 1, [400000], [0]],
  ['orientation2', 1, [400000], [90]],
  ['orientation3', 1, [400000], [180]],
  ['orientation4', 1, [400000], [270]],
  ['orientation5', 1, [400000], [45]],
  ['orientation6', 1, [400000], [6.5]],
  ['orientation7', 1, [400000], [347]],
  ['size1', 0, [900], [0]], // too small
  ['size2', 1, [480000], [0]],
  ['size3', 1, [60000], [0]],
  ['size4', 1, [1000000], [0]],
  ['multiple1', 2, [225150], [0]],
  ['multiple2', 10, [40000], [0]],
]

function checkScreenCreation(i){
  if (i < screenImages.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + screenImages[i][0] + '.jpg')
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
  if (i < screenImages.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + screenImages[i][0] + '.jpg')
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

      var errorMessage = "Nb screens in " + screenImages[i][0] + " has to be " + screenImages[i][1] + " but returns " + inputImage.screens.length;
      console.assert(inputImage.screens.length == screenImages[i][1], errorMessage);
      

      checkNbScreens(i + 1)
    }
  } else console.log("Stop nb screens check")
}

function checkSize(i){
  if (i==0) console.log("Start size check")
  if (i < screenImages.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + screenImages[i][0] + '.jpg')
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
        for(let k = 0; k < screenImages[i][2].length; k++){
          min = Math.min(min, Math.abs(inputImage.screens[j].size - screenImages[i][2][k]))
        }
        var errorMessage = "Screen size in " + screenImages[i][0] + " has to be "+ screenImages[i][2][0] + " but returns " + inputImage.screens[j].size
          console.assert(min < 5000, errorMessage);
        
      }

      checkSize(i + 1)
    }
  } else  console.log("Stop size check")
}


function checkOrientation(i) {
  if(i == 0) console.log("Start orientation check")
  if (i < screenImages.length) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx

    image.setAttribute('src', sourceFolder + screenImages[i][0] + '.jpg')
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
        for(let k = 0; k < screenImages[i][3].length; k++){
          min = Math.min(min, Math.abs(inputImage.screens[j].orientation - screenImages[i][3][k]))
        }
        var errorMessage = "Screen orientation in " + screenImages[i][0] + " has to be "+ screenImages[i][3][0]+" but returns " + inputImage.screens[j].orientation;
          console.assert(min < 2, errorMessage);

        
      }



      checkOrientation(i + 1)
    }
  } else   console.log("Stop orientation check")

}

/**
 * 
 * @param {int} fl focal length: 20..40
 */
function TestCrossFolder(fl){

  let folder = "Cross-" + fl.toString();
  
  // for (let i = 1; i <= 18; i++) {
  //   let src = "/" + folder + "/" + GenCrossFilename(i);
  //   console.log("filename: " + folder + "/" + GenCrossFilename(i));

  //   TestCross(src);


  // }  
  
  TestCross(1, folder);

}

function GenCrossFilename(i){
  if(i.toString().length > 1){
    return "00" + i.toString() + ".png";
  }else{
    return "000" + i.toString() + ".png";
  }
}

function TestCross(i, folder){
  if (i < 18) {
    var image = document.createElement('img')
    var canvas = document.createElement('canvas')
    var ctx;

    let file = "/" + folder + "/" + GenCrossFilename(i);

    document.getElementById("bert").setAttribute('src', sourceFolder + "CrossTest" + file)

    image.setAttribute('src', sourceFolder + "CrossTest" + file);
    console.log(image.src);
    image.onload = function () {
      console.log("exec: " + file);
      ctx = canvas.getContext('2d')
      canvas.width = image.width
      canvas.height = image.height
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, image.width, image.height)
      let imgData = ctx.getImageData(0, 0, image.width, image.height)
      var inputImage = new Image(imgData, '', 'RGBA', image.width, image.height, null)

      // inputImage.rgbaToHsla();
      // inputImage.createGreenBlueMask();
      // inputImage.medianBlurMatrix(3);
      // inputImage.createScreens();

      console.log("exec: " + file);

      inputImage.rgbaToHsla();
      inputImage.createBigMask();
      inputImage.medianBlurMatrix(3);
      inputImage.medianBlur(3);
      inputImage.createOffset(3);
      inputImage.createScreens();
      inputImage.hslaToRgba();
      //inputImage.show();
    }

    i++;
    TestCross(i, folder);
  }
}
