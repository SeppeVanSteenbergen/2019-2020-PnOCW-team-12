importScripts('algorithms/Algebra.js', 'algorithms/Animations.js', 'algorithms/ColorRange.js', 'algorithms/ColorSpace.js', 'algorithms/Communicator.js', 'algorithms/CornerDetector.js', 'algorithms/Delaunay.js', 'algorithms/DetectionDrawer.js', 'algorithms/Drawer.js', 'algorithms/Image.js', 'algorithms/Island.js', 'algorithms/Line.js', 'algorithms/PermutationConverter.js', 'algorithms/PixelIterator.js', 'algorithms/Point.js', 'algorithms/Reconstructor.js', 'algorithms/RGBBarcodeScanner.js', 'algorithms/Screen.js', 'algorithms/Triangle.js')

console.log('Worker Created')

self.addEventListener("message", handleMessage)

function handleMessage(m) {
    if (m.data.text === 'START') {
        analyseImage(m.data.param[0], m.data.param[1])
    }
}

function analyseImage(imgData, clientInfo) {
    console.log("start analyse image on worker")

    let result = new Image(imgData, null, 'RGBA', clientInfo, null)

    console.log("worker done!")

    // console.log(inputImage.screens)

    self.postMessage({ text: "DONE", result: result})

}

