var screen = {
  width: 1920,
  height: 1080
}

function getTransformedCanvas(canvas, CSSTransform) {
  return new Promise(function(res, rej) {
    var dim = getTransformedDimensions(canvas, CSSTransform)
    var xlinkNS = 'http://www.w3.org/1999/xlink',
        svgNS = 'http://www.w3.org/2000/svg'
    var svg = document.createElementNS(svgNS, 'svg'),
        defs = document.createElementNS(svgNS, 'defs'),
        style = document.createElementNS(svgNS, 'style'),
        image = document.createElementNS(svgNS, 'image')
    image.setAttributeNS(xlinkNS, 'href', canvas.toDataURL())
    image.setAttribute('width', canvas.width)
    image.setAttribute('height', canvas.height)
    style.innerHTML = 'image{' + CSSTransform + ';}'
    svg.appendChild(defs)
    defs.appendChild(style)
    var rect = document.createElement('rect')

    svg.appendChild(image)
    svg.setAttribute('width', dim.width)
    svg.setAttribute('height', dim.height)
    var svgStr = new XMLSerializer().serializeToString(svg)
    var img = new window.Image()
    img.onload = function() {
      res(img)
    }
    img.onerror = rej
    img.src = URL.createObjectURL(new Blob([svgStr], { type: 'image/svg+xml' }))
  })
}

function getTransformedDimensions(canvas, CSSTransform) {
  var orphan = !canvas.parentNode
  if (orphan) document.body.appendChild(canvas)
  var oldTrans = getComputedStyle(canvas).transform
  canvas.style.transform = CSSTransform
  var rect = canvas.getBoundingClientRect()
  canvas.style.transform = oldTrans
  if (orphan) document.body.removeChild(canvas)
  return rect
}

let imgElement = document.createElement('img')
imgElement = document.getElementById('imageSrc')
let inputElement = document.getElementById('fileInput')
inputElement.addEventListener(
    'change',
    e => {
      imgElement.src = URL.createObjectURL(e.target.files[0])
    },
    false
)
imgElement.onload = function() {
  //let resizedImage = Image.resizeImage(imgElement, [1920, 1080]);
  let c = document.createElement('canvas')
  c.width = imgElement.width
  c.height = imgElement.height
  let ctx = c.getContext('2d')
  ctx.drawImage(imgElement, 0, 0, c.width, c.height)

  let imgData = ctx.getImageData(0, 0, c.width, c.height)
  let imgDataResized = Image.resizeImageData(imgData, [1920, 1080])

  let inputCanvas = document.getElementById('inputImage')
  let inputContext = inputCanvas.getContext('2d')
  inputContext.clearRect(0, 0, inputCanvas.width, inputCanvas.height)
  inputCanvas.width = imgDataResized.width
  inputCanvas.height = imgDataResized.height
  inputContext.putImageData(imgDataResized, 0, 0)
  let imageTest = new Image(imgDataResized, 'inputImage', 'RGBA', [
    { size: { width: screen.width, height: screen.height } },
    { size: { width: screen.width, height: screen.height } },
    { size: { width: screen.width, height: screen.height } }
  ])

  let transImage = document.getElementById('transImg')
  let [boxWidth, boxHeight] = imageTest.createPictureCanvas(
      transImage.width,
      transImage.height
  )

  let extremeValues = imageTest.findExtremeValues()

  let h = imageTest.screens[0].cssMatrix
  // let h2 = imageTest.screens[1].cssMatrix
  // let h3 = imageTest.screens[2].cssMatrix
  let t =
      'position: absolute; left:' +
      extremeValues.minx +
      'px; top: ' +
      extremeValues.miny +
      'px; transform: matrix3d(' +
      h.join(', ') +
      '); transform-origin: ' +
      -extremeValues.minx +
      'px ' +
      -extremeValues.miny +
      'px; width: ' +
      boxWidth +
      'px; height: ' +
      boxHeight +
      'px; object-fit: none'
  // let t2 = "position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px; transform: matrix3d(" + h2.join(", ") + "); transform-origin: " + -extremeValues.minx + "px " + -extremeValues.miny + "px; width: " + boxWidth + "px; height: " + boxHeight + "px; object-fit: none";
  //let t3 = "position: absolute; left:" + extremeValues.minx + "px; top: " + extremeValues.miny + "px; transform: matrix3d(" + h3.join(", ") + "); transform-origin: " + -extremeValues.minx + "px " + -extremeValues.miny + "px; width: " + boxWidth + "px; height: " + boxHeight + "px; object-fit: none";
  let transCanv = document.createElement('canvas')
  transCanv.width = transImage.width
  transCanv.height = transImage.height
  transCanv.getContext('2d').drawImage(transImage, 0, 0)

  let outputCanvas = document.getElementById('output')

  let t2 =
      'translate(' +
      -extremeValues.minx +
      'px, ' +
      -extremeValues.miny +
      'px) ' +
      'matrix3d(' +
      h.join(', ') +
      ')'
  getTransformedCanvas(transCanv, t)
      .then(function(img) {
        outputCanvas.width = screen.width
        outputCanvas.height = screen.height
        outputCanvas.getContext('2d').drawImage(img, 0, 0)

        outputCanvas.requestFullscreen()

        document.getElementById('inpDiv').style.display = 'none'
      })
      .catch(console.error)

  /*outputCanvas.style = t
  let outputContext = outputCanvas.getContext('2d')
  outputCanvas.width = boxWidth
  outputCanvas.height = boxHeight
  outputContext.drawImage(
    transImage,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height
  )*/

  // let outputCanvas2 = document.getElementById("output2")
  // outputCanvas2.style = t2
  // let outputContext2 = outputCanvas2.getContext("2d")
  // outputCanvas2.width = boxWidth
  // outputCanvas2.height = boxHeight
  // outputContext2.drawImage(transImage, 0, 0, outputCanvas2.width, outputCanvas2.height)

  // let outputCanvas3 = document.getElementById("output3")
  // outputCanvas3.style = t3
  // let outputContext3 = outputCanvas3.getContext("2d")
  // outputCanvas3.width = boxWidth
  // outputCanvas3.height = boxHeight
  // outputContext3.drawImage(transImage, 0, 0, outputCanvas3.width, outputCanvas3.height)

  //ColorSpace.hslaToRgba(imageTest.pixels)
  //imageTest.show()
}
