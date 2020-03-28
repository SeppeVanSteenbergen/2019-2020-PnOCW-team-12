console.log('hello from worker!')

self.addEventListener("message", handleMessage)

function handleMessage(m){
    if(m.data.text === "START"){
        analyseImage(m.data.param[0], m.data.param[1], m.data.param[2])
    }
}

function analyseImage(imgData, clientInfo, masterVue){
    console.log("start analyse image on worker")
    imgData = ImageAlg.resizeImageData(imgData, [1920, 1080])
    let communicator = new Communicator(masterVue)

    let inputImage = new ImageAlg(imgData, null, 'RGBA', clientInfo, communicator)

    console.log("worker done!")

    self.postMessage({text: "DONE", result: inputImage})

}

