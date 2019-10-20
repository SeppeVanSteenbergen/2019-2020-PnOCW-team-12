const dataHelper = require('./dataHelper')
const io = require('../app').io

module.exports = {
  updateAllRoomLists() {
    console.log('updating all roomlists')
    const activeSocketIDs = dataHelper.getAllActiveSocketIDs()
    console.log(activeSocketIDs)
    for (let i = 0; i < activeSocketIDs.length; i++) {
      io.to(activeSocketIDs[i]).emit('roomListUpdate', dataHelper.getRoomList())
    }

    console.log(roomList)
  },
  updateRoomList(socket_id) {
    console.log('update room list')
    io.to(socket_id).emit('roomListUpdate', dataHelper.getRoomList())
  },

  getSocketFromID(socket_id) {
    return io.eio.clients[socket_id]
  },
  /*
	a screen command is of form
	{
		payload: {
			type: (type of command)
			data: { (all data needed for the execution)
						command:    (example of data to be sent)
						...
			}
		}

		to: 'all' / user_id

	}

	 -----PAYLOADS----

	countDown
	{
		type: 'count-down',
		data: {
			start: (starting number, must be an integer above 0)
			interval: (in milliseconds)
		}
	}

	drawDirections
	{
		type: 'draw-directions',
		data: {
			command: [{
				deg: (degrees from top)
				label: (text to display besides the arrow)
			}, ...]
		}
	}

	floodScreen
	{
		type: 'flood-screen',
		data: {
			command: [{
				type: 'color'/'interval',
				value: '[255,0,0]' / '200'     (integer or an rgb tuple) time in milliseconds
			}]
		}
	}

	displayDetectionScreen
	{
	  type: 'display-detection-screen',
	  data: {
	    id: 4    (positive integer between 0 and 119
    }
  }

   displayImage
   {
      type: 'display-image'
      data: {
        image: (image in base64 encoded string)
        }
    }
	*/

  // TODO check for message integrity
  screenCommand(user_id, message) {
    console.log('SCREEN COMMAND')
    console.log(message)
    if (!dataHelper.isMasterUser(user_id)) {
      console.log('The user is not allow to send this command')
      return 1
    }

    if (message.to !== 'all') {
      this.sendDataByUserID('screenCommand', message.payload, message.to)
    } else {
      this.sendDataToRoomOfMaster('screenCommand', message.payload, user_id)
    }
  },
  closeRoom(user_id) {
    dataHelper.closeRoom(user_id)
    this.updateAllRoomLists() // TODO only update the clients from the room
  },
  openRoom(user_id) {
    dataHelper.openRoom(user_id)
    this.updateAllRoomLists() // TODO only update the clients from the room
  },
  toggleRoom(user_id) {
    dataHelper.toggleRoom(user_id)
    this.updateAllRoomLists() // TODO only update the clients from the room
  },
  sendDataByUserID(name, data, user_id) {
    this.sendDataBySocketID(
      name,
      data,
      dataHelper.getSocketIDFromUserID(user_id)
    )
  },
  sendDataBySocketID(name, data, socket_id) {
    io.to(socket_id).emit(name, data)
  },

  sendDataToRoomOfMaster(name, data, master_user_id) {
    if (!dataHelper.isMasterUser(master_user_id)) {
      console.log('The given user is not a master user')
      return 1
    }
    const clientList = dataHelper.getClientsOfRoom(
      dataHelper.getUserRoom(master_user_id)
    )
    console.log('CLIENTS IN ROOM')
    console.log(clientList)

    for (let i in clientList) {
      this.sendDataByUserID(name, data, clientList[i])
    }
  },
  sendSuccessMessageToSocket(socket_id, message) {
    this.sendDataBySocketID('successMessage', message, socket_id)
  },
  sendErrorMessageToSocket(socket_id, message) {
    this.sendDataBySocketID('errorMessage', message, socket_id)
  },
  disconnectSocket(socket_id) {
    io.sockets.connected[socket_id].disconnect()
  }

}
