const dataHelper = require('./dataHelper')
const io = require('../app').io

let pingAmount = 4

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
		type: 'drawSnow-directions',
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

    imageCSS
    {
      type: 'display-image-css'
      data: {
        image: (base64 image)
        ox: (x offset in px, integer value)
        oy: (y offset in px, integer value)
        w: (width in px, integer value)
        h: (height in px, integer value)
        css: (css for the target canvas element)
     }

     loadVideo
     {
        type: 'load-video'
        data: {
          videoURL: (relative url of the video file),
          ox: (x offset in px, integer value)
          oy: (y offset in px, integer value)
          w: (width in px, integer value)
          h: (height in px, integer value)
          css: (css for the target canvas element)
        }

     }

     startVideo
     {
        type: 'start-video'
        data: {}
     }

     pauseVideo
     {
        type:'pause-video'
        data:{}
     }

     restartVideo
     {
      type: 'restart-video'
      data: {}
     }

     initAnimation
     {
      type: 'animation-init'
      data: {
          triangulation: [Tri1, Tri2, ..]  (list of triangles
          midpoints: [[12,23],[123,123],...]   (list of points)
          width: (width of the original image)
          height: (height of the original image)

          css: (css for the output canvas)
          ox: (x offset in px, integer value)
          oy: (y offset in px, integer value)
          w: (width in px, integer value for transformation)
          h: (height in px, integer value for transformation)
      }
     }
	*/

  // TODO check for message integrity
  screenCommand(user_id, message) {
    console.log('SCREEN COMMAND')
    if (!dataHelper.isMasterUser(user_id)) {
      console.log('The user is not allowed to send this command')
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
  /**
   *
   * @param user_id
   * @param data
   *        [x,y,angle,frame, right]
   */
  animationFrame(user_id, data) {
    this.sendDataToRoomOfMaster('af', data, user_id)
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
  sendDataToRoom(name, data, room_id) {
    const clientList = dataHelper.getClientsOfRoom(room_id)
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

  /*pong(user_id, data) {
    let pingTimes = 10
    let currentTime = Date.now()
    let ping = currentTime - data.startTime
    // time to add to server time to get client time

    if (typeof pingList[data.room_id] === 'undefined' || typeof pingList[data.room_id][user_id] === 'undefined') {
      pingList[data.room_id] = {}
      pingList[data.room_id][user_id] = {
        pingList: [],
        ready: false
      }
    }

    pingList[data.room_id][user_id].pingList.push(ping)*/

  /*pingList[data.room_id][user_id] = {
      ping: ping,
      timeDelta: timeDelta
    }*/

  /*if (pingList[data.room_id][user_id].pingList.length >= pingTimes) {
      pingList[data.room_id][user_id].ready = true
      pingList[data.room_id][user_id].ping =
        pingList[data.room_id][user_id].pingList.reduce((a, b) => a + b) /
        pingList[data.room_id][user_id].pingList.length
      let timeDelta =
        data.clientTime + pingList[data.room_id][user_id].ping / 2 - currentTime
      pingList[data.room_id][user_id].timeDelta = timeDelta

      let foundFalse = false
      for (let i = 0; i < Object.keys(pingList[data.room_id]).length; i++) {
        if (!pingList[data.room_id][i].ready) {
          foundFalse = true
          break
        }
      }

      if (
        !foundFalse &&
        Object.keys(pingList[data.room_id]).length ===
          dataHelper.getClientsOfRoom(data.room_id).length
      ) {
        this.sendCountDown(data.room_id, data)
      }
    } else {
      this.pingUser(user_id, data)
    }
  },*/
  pingRoom(room_id, data) {
    let clients = dataHelper.getClientsOfRoom(room_id)

    for (let i in clients) {
      console.log(clients[i], room_id)
      this.pingUser(clients[i], data)
    }
  },
  /*pingUser(user_id, data) {
    let payload = {
      command: data.command,
      startOffset: data.startOffset,
      startTime: Date.now(),
      room_id: data.room_id
    }

    this.sendDataByUserID('pings', payload, user_id)
  },*/
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
    pingList[room_id] = {}

    this.pingRoom(room_id, {
      command: data,
      startOffset: startOffset,
      room_id: room_id
    })
  },
  sendCountDown(room_id, data) {
    console.log('send countDown')
    let clients = dataHelper.getClientsOfRoom(room_id)

    let clientPings = pingList[room_id]

    let startOffset = 200 // ms

    let payload = {
      type: 'count-down',
      data: data.command
    }

    let now = new Date().getTime()

    for (let i in clients) {
      payload.data.startTime =
        now + clientPings[clients[i]].timeDelta + startOffset

      this.sendDataByUserID('screenCommand', payload, clients[i])
    }
  },
  syncRoomOfMaster(user_id) {
    if (!dataHelper.isMasterUser(user_id)) {
      console.log('The user is not allowed to send the sync command')
      return 1
    }
    // reset all sync data
    // TODO: this will remove data from all rooms tho
    let room_id = dataHelper.getUserRoom(user_id)
    pingList = {}
    pingList[room_id] = {}

    let user_ids = dataHelper.getClientsOfRoom(room_id)

    // master sync
    pingList[room_id][user_id] = {
      deltas: [],
      ready: false
    }
    this.pingUser(user_id)

    // client sync
    for (let i = 0; i < user_ids.length; i++) {
      pingList[room_id][user_ids[i]] = {
        deltas: [],
        ready: false
      }
      this.pingUser(user_ids[i])
    }
  },
  pingUser(user_id) {
    this.sendDataByUserID('pings', Date.now(), user_id)
  },
  /**
   *
   * @param user_id
   * @param data
   * {
   * TC2: ,
   * TC1: ,
   * TS1: ,
   * D: D
   * }
   *
   */
  pong(user_id, dat) {
    const TS2 = Date.now()
    const D2 = dat.TC2 - TS2
    const timeOffset = -(D2 + dat.D) / 2
    let room_id = dataHelper.getUserRoom(user_id)
    pingList[room_id][user_id].deltas.push(timeOffset)
    if (pingList[room_id][user_id].deltas.length >= pingAmount) {
      let delta =
        pingList[room_id][user_id].deltas.reduce((a, b) => a + b) /
        pingList[room_id][user_id].deltas.length

      pingList[room_id][user_id].ready = true

      this.sendDataByUserID('syncInfo', { delta: delta }, user_id)
      this.checkPingFinished(room_id)
    } else {
      this.pingUser(user_id)
    }
  },
  /**
   *  Checks if all users from the given room have all theri pings received
   *
   * @param room_id
   */
  checkPingFinished(room_id) {
    if (typeof pingList[room_id] === 'undefined') return
    for (let user_id in Object.keys(pingList[room_id])) {
      if (typeof pingList[room_id][user_id] === 'undefined' || !pingList[room_id][user_id].ready) return
    }
    this.sendDataToRoom('syncReady', '', room_id)

    //TODO remove only the room_id from the list
    pingList[room_id] = {}
  }
}
