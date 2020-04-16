import '../algorithms/Communicator'

export default class WaitEnv {
  constructor(worker, communicator, barContainer, msgBoxContainer) {
    this.worker = worker
    this.communicator = communicator

    console.log('DOM ELEM: ' + barContainer)
    this.barContainer = barContainer
    this.bar = barContainer.children[0]

    this.msgContainter = msgBoxContainer //div
    this.msgList = msgBoxContainer.children[0] //ul

    this.workerFinished = false

    worker.addEventListener('message', this, false)

    this.initUI()

    this.progress = 0
  }

  initUI() {
    this.barContainer.style.width = '100%'
    this.barContainer.style.height = '35px'
    this.barContainer.style.backgroundColor = '#b3d4fc'

    this.bar.style.width = '0%'
    this.bar.style.height = '100%'
    this.bar.style.backgroundColor = '#2196f3'

    this.msgContainter.style.width = '100%'
    this.msgContainter.style.height = '180px'
    this.msgContainter.style.overflowX = 'hidden'
    this.msgContainter.style.overflowY = 'auto'
  }

  updateBar(pct, error = false) {
    this.progress = error ? 100 : Math.min(this.progress + pct, 100)

    this.bar.style.width = this.progress + '%'

    if (this.progress == 100) {
      this.bar.style.backgroundColor = error ? 'red' : 'green'
    }
  }

  addMessage(str, error = false) {
    var node = document.createElement('LI') // Create a <li> node
    str = (error ? 'ERROR: ' : '') + str
    var textnode = document.createTextNode(str)

    node.appendChild(textnode)
    this.msgList.appendChild(node)

    if (error) {
      node.style.color = 'red'
    }

    // Keep scroll to the bottom when new item is added to the list
    this.msgContainter.scrollTop = this.msgContainter.scrollHeight
  }

  addSeparator() {
    var textnode = document.createTextNode('______________________')

    this.msgList.appendChild(textnode)

    this.msgContainter.scrollTop = this.msgContainter.scrollHeight
  }

  handleEvent(evt) {
    switch (evt.type) {
      case 'message':
        if (evt.data.text === 'DONE') {
          console.log('ending the worker and saving result and stuff')
          this.result = evt.data.result

          this.workerFinished = true

          this.worker.terminate()

          // console.log(this.result.clientInfo)
          // this.addMessage(this.result.clientInfo.length)

          let success = true

          if (this.result.clientInfo.length !== this.result.screens.length) {
            success = false
          }

          if (success) {
            this.communicator.sendSuccessMessage('Analyse Done')
          } else {
            this.updateBar(0, true) //make bar error!
            this.addMessage(
              'Numer of Screens and Number of Clients do not match:',
              true
            )
            this.addMessage(
              'Connected Clients: ' + this.result.clientInfo.length
            )
            this.addMessage('Found Screens: ' + this.result.screens.length)

            this.communicator.sendErrorMessage('Problem with Analysation')
          }

          // this.addMessage("--------------------------------")
          this.addSeparator()
        }

        if (evt.data.text === 'UPDATE') {
          this.updateBar(evt.data.pct)
          this.addMessage(evt.data.msg)
        }

        if (evt.data.text === 'ERROR') {
          this.addMessage(evt.data.msg, true)
        }

        if (evt.data.text === 'MESSAGE') {
          this.addMessage(evt.data.msg)
        }

        break

      default:
        break
    }
  }

  getResult() {
    return this.result
  }

  isFinished() {
    return this.workerFinished
  }
}
