class AnalyseEnv{
    
    constructor(communicator){
        this.communicator = communicator;

        this.worker = new Worker('./worker.js')
        // this.worker.addEventListener("message", handleMessage)
        this.worker.postMessage({
            text: 'START',
            param: []
        })
    }



}