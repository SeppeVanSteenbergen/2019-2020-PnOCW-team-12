import '../algorithms/Communicator'

export default class WaitEnv {

    constructor(worker, communicator, barContainer, msgBoxContainer) {
        this.worker = worker
        this.communicator = communicator

        console.log("DOM ELEM: " + barContainer)
        this.barContainer = barContainer
        this.bar = barContainer.children[0]

        this.msgBoxContainer = msgBoxContainer //div
        this.msgList = msgBoxContainer.children[0] //ul

        this.workerFinished = false

        worker.addEventListener('message', this, false)

        this.initUI()

        this.progress = 0
    }

    initUI(parent) {

        this.barContainer.style.width = "100%"
        this.barContainer.style.height = "35px"
        this.barContainer.style.backgroundColor = "#b3d4fc"

        this.bar.style.width = "0%";
        this.bar.style.height = "100%"
        this.bar.style.backgroundColor = "#2196f3"
    }

    updateBar(pct) {

        this.progress = Math.min(this.progress + pct, 100)

        this.bar.style.width = this.progress + "%"

        if (this.progress == 100) {
            this.bar.style.backgroundColor = "green"
        }

    }

    // TODO: overlap met progressbar nu 
    addMessage(str) {
        var node = document.createElement("LI");                 // Create a <li> node
        var textnode = document.createTextNode(str);

        node.appendChild(textnode)
        this.msgList.appendChild(node)
    }

    handleEvent(evt) {

        switch (evt.type) {
            case "message":
                if (evt.data.text === 'DONE') {
                    console.log("ending the worker and saving result and stuff")
                    this.result = evt.data.result

                    this.workerFinished = true

                    this.worker.terminate()

                    this.communicator.sendSuccessMessage('Analyse Done')
                }

                if (evt.data.text === 'UPDATE') {
                    this.updateBar(evt.data.pct)
                    // this.addMessage(evt.data.msg)
                }

                break;

            default:
                break;
        }
    }

    getResult() {
        return this.result
    }

    isFinished() {
        return this.workerFinished
    }
}