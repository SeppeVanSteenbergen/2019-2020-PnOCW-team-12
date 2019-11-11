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

    if (message.payload.type === 'count-down') {
      this.handleCountDown(user_id, message.payload.data)
    } else if (message.to !== 'all') {
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
    if (data === null) {
      io.to(socket_id).emit(name)
    } else {
      io.to(socket_id).emit(name, data)
    }
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
  sendClientInfo(master_user_id) {
    if (!dataHelper.isMasterUser(master_user_id)) {
      console.log('The given user is not a master user')
      return 1
    }

    const clientList = dataHelper.getClientsOfRoom(
      dataHelper.getUserRoom(master_user_id)
    )

    const clientInfo = clientList.map(user_id =>
      dataHelper.getUserInfo(user_id)
    )

    this.sendDataByUserID('roomClientInfo', clientInfo, master_user_id)
  },
  updateRoomClientInfo(master_user_id) {
    if (!dataHelper.isMasterUser(master_user_id)) {
      console.log('The given user is not a master user')
      return 1
    }

    const clientList = dataHelper.getClientsOfRoom(
      dataHelper.getUserRoom(master_user_id)
    )
    for (let i = 0; i < clientList.length; i++) {
      this.sendDataByUserID('updateScreenSize', null, clientList[i])
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
  },

  /*
    on receiving pong data,
   */

  pong(user_id, data) {
    let currentTime = new Date().getTime()
    let ping = currentTime - data.startTime
    // time to add to server time to get client time
    let timeDelta = data.clientTime - ping / 2 - currentTime

    pingList[data.room_id][user_id] = {
      ping: ping,
      timeDelta: timeDelta
    }

    if (
      Object.keys(pingList[data.room_id]).length ===
      dataHelper.getClientsOfRoom(data.room_id).length
    ) {
      this.sendCountDown(room_id, data)
    }
  },
  pingRoom(room_id, data) {
    let clients = dataHelper.getClientsOfRoom(room_id)

    for (let i = 0; i < clients.length; i++) {
      this.pingUser(clients[i], data)
    }
  },
  pingUser(user_id, data) {
    let payload = {
      command: data.command,
      startOffset: data.startOffset,
      startTime: new Date().getTime(),
      room_id: data.room_id
    }

    this.sendDataByUserID('ping', user_id, payload)
  },
  /**
   * Steps
   * 1) Save all the client latencies
   * 2) Calculate all the client start times
   * 3) Send all the start times with the data
   * @param data
   *        data.start
   *        data.interval
   * @param master_id
   *        the user_id of a master in a room
   */
  handleCountDown(master_id, data) {
    let startOffset = 200 // ms
    let room_id = dataHelper.getUserRoom(master_id)

    this.pingRoom(room_id, {
      command: data,
      startOffset: startOffset,
      room_id: room_id
    })
  },
  sendCountDown(room_id, data) {
    let clients = dataHelper.getClientsOfRoom(room_id)

    let clientPings = pingList[room_id]

    let startOffset = 200 // ms

    let payload = {
      type: 'count-down',
      data: data.command
    }

    for (let i = 0; i < clients.length; i++) {
      payload.startTime =
        new Date().getTime() + clientPings[clients[i]].timeDelta + startOffset

      this.sendDataByUserID('screenCommand', payload, clients[i])
    }
  }
}
