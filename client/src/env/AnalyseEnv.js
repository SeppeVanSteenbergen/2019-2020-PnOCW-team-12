import Image from '../algorithms/Image'
import '../algorithms/Communicator'

export default class AnalyseEnv {

    constructor(inputImageData, clientInfo, communicator) {
        this.communicator = communicator;
        this.imgData = Image.resizeImageData(inputImageData, [1920, 1080])
        this.clientInfo = clientInfo

        this.worker = new Worker('./worker.js')

        this.startExecution()

    }

    startExecution(){
        this.worker.postMessage({
            text: 'START',
            param: [this.imgData, this.clientInfo]
        })

        this.communicator.sendSuccessMessage('Started Analysation on Worker Thread', 4000)
    }

    getWorker(){
        return this.worker
    }
}