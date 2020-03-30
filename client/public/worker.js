// importScripts("algorithms/Image.js", "algorithms/Communicator.js")
// importScripts("algorithms/Island.js", "algorithms/Drawer.js", "algorithms/Colorspace.js", "algorithms/ColorRange.js")
// importScripts
importScripts('algorithms/Algebra.js', 'algorithms/Animations.js', 'algorithms/ColorRange.js', 'algorithms/ColorSpace.js', 'algorithms/Communicator.js', 'algorithms/CornerDetector.js', 'algorithms/Delaunay.js', 'algorithms/DetectionDrawer.js', 'algorithms/Drawer.js', 'algorithms/Image.js', 'algorithms/Island.js', 'algorithms/Line.js', 'algorithms/PermutationConverter.js', 'algorithms/PixelIterator.js', 'algorithms/Point.js', 'algorithms/Reconstructor.js', 'algorithms/RGBBarcodeScanner.js', 'algorithms/Screen.js', 'algorithms/Triangle.js')

console.log('hello from worker!')

self.addEventListener("message", handleMessage)

function handleMessage(m) {
    if (m.data.text === "START") {
        analyseImage(m.data.param[0], m.data.param[1], m.data.param[2])
    }
}

function analyseImage(imgData, clientInfo, masterVue) {
    console.log("start analyse image on worker")
    // imgData = Image.resizeImageData(imgData, [1920, 1080])
    let communicator = new Communicator(masterVue)

    let inputImage = new Image(imgData, null, 'RGBA', clientInfo, communicator)

    console.log("worker done!")

    console.log(inputImage.screens)

    self.postMessage({ text: "DONE", result: inputImage })

}

