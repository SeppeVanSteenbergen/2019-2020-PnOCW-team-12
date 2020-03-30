import '../algorithms/Communicator'

export default class WaitEnv{

    constructor(worker, communicator, parentDiv){
        this.worker = worker
        this.communicator = communicator

        this.workerFinished = false

        worker.addEventListener('message', this, false)

        this.initUI()
    }

    initUI(parent){
        // TODO
    }

    updateUI(){
        // TODO
    }

     handleEvent(evt){

        switch (evt.type) {
            case "message":
                if(evt.data.text === 'DONE'){
                    console.log("ending the worker and saving result and stuff")
                    this.result = evt.data.result
        
                    this.workerFinished = true
        
                    this.worker.terminate()
        
                    this.communicator.sendSuccessMessage('Analyse Done')
                }
                
                break;
        
            default:
                break;
        }


    }

    getResult(){
        return this.result
    }

    isFinished(){
        return this.workerFinished
    }

    setFinished(){
        this.workerFinished = true
    }

    terminateWorker(){
        this.worker.terminate()
    }

    getCommunicator(){
        return this.communicator
    }

    setResult(result){
        this.result = result
    }
}