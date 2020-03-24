import Master from '../views/Master'

export default class Communicator {

    constructor(masterVue) {
        this.masterVue = masterVue;
    }

    sendSuccessMessage(message, time){
        this.masterVue.printToConsole(message, "success", time);
    }

    sendSuccessMessage(message){
        this.masterVue.printToConsole(message, "success");
    }

    sendErrorMessage(message, time){
        this.masterVue.printToConsole(message, "error", time);
    }

    sendErrorMessage(message){
        this.masterVue.printToConsole(message, "error");
    }

    sendInfoMessage(message, time){
        this.masterVue.printToConsole(message, "info", time);
    }

    sendInfoMessage(message)
    {
        this.masterVue.printToConsole(message, "info");
    }
}