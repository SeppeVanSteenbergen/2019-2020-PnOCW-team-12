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
  ['size1', 1, [26000], [0]], // 7
  ['size2', 1, [140000], [0]]
]
var orientation = [0, 7]

function loadImage(imageName) {
  fs.readdir(sourceFolder, (err, files) => {
    if (err) {
      console.error('Could not load the images')
    }

    files.forEach(file => {
      if (file.includes(imageName)) return file
    })
    console.log(images)
  })
}

function load() {
  for (let i = 0; i < images.length; i++) {
    this.images[i] = loadImage(this.images[i][0])
  }
}

function checkOrientation() {
  checkOrientationHelper(0)
}

function checkOrientationHelper(i) {
  if (i < orientation[1]) {
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

      console.assert(inputImage.screens.length == images[i][1]); //aantal schermen
      
      for(let j = 0; j < inputImage.screens.length; j++){ //grootte schermen
        var min = Infinity;
        for(let k = 0; k < images[i][3].length; k++){
          min = Math.min(min, Math.abs(inputImage.screens[j].size - images[i][2][k]))
        }
        console.assert(min < 5000);
      }

      for(let j = 0; j < inputImage.screens.length; j++){ //orientatie schermen
        var min = 360;
        for(let k = 0; k < images[i][3].length; k++){
          min = Math.min(min, Math.abs(inputImage.screens[j].orientation - images[i][3][k]))
        }
        console.assert(min < 0.5);
      }



      checkOrientationHelper(i + 1)
    }
  } else {
    console.log('orientation checked') // einde
  }
}


function runAllTests() {
  let results = []
  for (let i = 0; i < images.length; i++) {
    let imageObject = document.getElementById('im')
    imageObject.setAttribute('src', sourceFolder + images[i][0] + '.jpg')
    imageObject.onload = () => {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.width = imageObject.width
      canvas.height = imageObject.height
      ctx.drawImage(imageObject, 0, 0, imageObject.width, imageObject.height)
      let imgData = ctx.getImageData(
        0,
        0,
        imageObject.width,
        imageObject.height
      )

      let inputImage = new Image(imgData, 'canv', 'RGBA')
      inputImage.rgbaToHsla()
      let imageOutGreen = new Image(
        inputImage.getImgData(),
        'imageOutGreen',
        'HSLA'
      )
      imageOutGreen.createGreenMask()
      let imageOutBlue = new Image(
        inputImage.getImgData(),
        'imageOutBlue',
        'HSLA'
      )
      imageOutBlue.createBlueMask()
      /*
      var imageOutConcatenated = new Image(imageOutGreen.getImgData(), "imageOutConcatenated", "HSLA");
      imageOutConcatenated.addImgData(imageOutBlue.getImgData());
      */

      let imageOutConcatenated = new Image(
        inputImage.getImgData(),
        'imageOutConcatenated',
        'HSLA'
      )
      imageOutConcatenated.createGreenBlueMask()
      console.log(imageOutConcatenated.getHeight())
      console.log(imageOutConcatenated.getWidth())
      console.log(imageOutConcatenated.matrix)
      //imageOutConcatenated.detectScreens();

      imageOutGreen.hslaToRgba()
      //imageOutGreen.show()
      imageOutBlue.hslaToRgba()
      //imageOutBlue.show()
      let imageOutSmoothened = new Image(
        imageOutConcatenated.getImgData(),
        'imageOutSmoothened',
        'HSLA'
      )

      imageOutConcatenated.hslaToRgba()

      imageOutSmoothened.cornerDetection()
      imageOutConcatenated.medianBlur(7)
      imageOutConcatenated.calcIslands()
      //imageOutConcatenated.show()
      imageOutSmoothened.hslaToRgba()
      //imageOutSmoothened.show()

      console.log('slsjdflkq')
    }
  }
}
