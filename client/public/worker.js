importScripts(
  'algorithms/Algebra.js',
  'algorithms/ColorRange.js',
  'algorithms/ColorSpace.js',
  'algorithms/CornerDetector.js',
  'algorithms/Image.js',
  'algorithms/Island.js',
  'algorithms/Line.js',
  'algorithms/PixelIterator.js',
  'algorithms/Reconstructor.js',
  'algorithms/RGBBarcodeScanner.js',
  'algorithms/Screen.js'
)

console.log('Worker Created')

self.addEventListener('message', handleMessage)

function handleMessage(m) {
  if (m.data.text === 'START') {
    analyseImage(m.data.param[0], m.data.param[1])
  }
}

function analyseImage(imgData, clientInfo) {
  console.log('start analyse image on worker')

  let resultImg = new Image(imgData, 'RGBA', clientInfo)

  console.log('worker done!')

  self.postMessage({ text: 'DONE', result: resultImg })
  self.close()
}
