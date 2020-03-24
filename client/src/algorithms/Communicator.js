export default class Communicator {
  constructor(masterVue) {
    this.masterVue = masterVue
  }

  runnable() {
    return this.masterVue !== null
  }

  sendSuccessMessage(message, time) {
    if (!this.runnable()) return
    this.masterVue.printToConsole(message, 'success', time)
  }

  sendSuccessMessage(message) {
    if (!this.runnable()) return
    this.masterVue.printToConsole(message, 'success')
  }

  sendErrorMessage(message, time) {
    if (!this.runnable()) return
    this.masterVue.printToConsole(message, 'error', time)
  }

  sendErrorMessage(message) {
    if (!this.runnable()) return
    this.masterVue.printToConsole(message, 'error')
  }

  sendInfoMessage(message, time) {
    if (!this.runnable()) return
    this.masterVue.printToConsole(message, 'info', time)
  }

  sendInfoMessage(message) {
    if (!this.runnable()) return
    this.masterVue.printToConsole(message, 'info')
  }
}
