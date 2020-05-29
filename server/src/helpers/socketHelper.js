const dataHelper = require('./dataHelper')
const io = require('../app').io

let pingAmount = 10

// bullet settings
let maxBullets = 10 // max alive bullets per player
let bulletShootTimeout = 120 // in ms   how many time between bullet

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
  /**
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
     
     startAnimation
     {
      type: 'animation-start'
      data: {
        startTime: [DateTime in ms]
      }

      stopAnimation
      {
        type: 'animation-stop'
        data: {}
      }

      initTracking
      {
        type: 'tracking-init',
        data: {}
      }
      updateTracking
      {
        type: 'tracking-update',
        data: {
          css: // css transformation matrix
        }
      }

      stopTracking
      {
        type: 'tracking-stop',
        data: {}
      }
     
	**/

  // TODO check for message integrity
  screenCommand(user_id, message) {
    console.log('SCREEN COMMAND')
    if (!dataHelper.isMasterUser(user_id)) {
      console.log('The user is not allowed to send this command')
      return 1
    }

    if (message.payload.type === 'count-down') {
      this.handleCountDown(user_id, message.payload.data)
    } else if (message.payload.type === 'start-video') {
      this.handleStartVideo(user_id)
    } else if (message.payload.type === 'animation-start') {
      this.handleAnimationStart(user_id, message)
    } else if (message.to !== 'all') {
      this.sendDataByUserID('screenCommand', message.payload, message.to)
    } else {
      this.sendDataToRoomOfMaster('screenCommand', message.payload, user_id)
    }
  },

  handleAnimationStart(user_id, message) {
    message.payload.data.startTime = Date.now() + 200
    if (message.to !== 'all') {
      this.sendDataByUserID('screenCommand', message.payload, message.to)
    } else {
      this.sendDataToRoomOfMaster('screenCommand', message.payload, user_id)
    }
  },

  handleStartVideo(master_id) {
    let startOffset = 400 // ms
    let room_id = dataHelper.getUserRoom(master_id)

    let payload = {
      type: 'start-video',
      data: {
        startTime: Date.now() + startOffset
      }
    }

    this.sendDataToRoom('screenCommand', payload, room_id)
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

    for (let i in clientList) {
      this.sendDataByUserID(name, data, clientList[i])
    }
  },
  sendDataToRoom(name, data, room_id) {
    const clientList = dataHelper.getClientsOfRoom(room_id)
    //console.log('CLIENTS IN ROOM')
    //console.log(clientList)

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
    let startOffset = 400 // ms
    let room_id = dataHelper.getUserRoom(master_id)

    let payload = {
      type: 'count-down',
      data: data
    }

    payload.data.startTime = Date.now() + startOffset

    this.sendDataToRoom('screenCommand', payload, room_id)
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
      if (
        typeof pingList[room_id][user_id] === 'undefined' ||
        !pingList[room_id][user_id].ready
      )
        return
    }
    this.sendDataToRoom('syncReady', '', room_id)

    //TODO remove only the room_id from the list
    pingList[room_id] = {}
  },

  updateSendControllerData(data, socket_id) {
    if (typeof controllerList[data.room_id] === 'undefined') return
    if (typeof controllerList[data.room_id][socket_id] === 'undefined') return

    controllerList[data.room_id][socket_id].pos.x += data.pos.x * 6
    controllerList[data.room_id][socket_id].pos.y += data.pos.y * 6

    if (data.dir !== null) {
      controllerList[data.room_id][socket_id].dir = data.dir
      if (
        controllerList[data.room_id][socket_id].bullet_amount < maxBullets &&
        Date.now() - controllerList[data.room_id][socket_id].lastBulletTime >
          bulletShootTimeout
      ) {
        if (typeof bulletList[data.room_id] === 'undefined')
          bulletList[data.room_id] = []
        let bullet = {
          pos: {
            x: controllerList[data.room_id][socket_id].pos.x,
            y: controllerList[data.room_id][socket_id].pos.y
          },
          dir: controllerList[data.room_id][socket_id].dir,
          frame: 0,
          socket_id: socket_id
        }
        bulletList[data.room_id].push(bullet)
        controllerList[data.room_id][socket_id].bullet_amount++
        controllerList[data.room_id][socket_id].lastBulletTime = Date.now()
      }
    }

    // limitations
    /*if (controllerList[data.room_id][socket_id].pos.x > width - size.x)
      controllerList[data.room_id][socket_id].pos.x = width - size.x
    if (controllerList[data.room_id][socket_id].pos.y > height - size.y)
      controllerList[data.room_id][socket_id].pos.y = height - size.y
    if (controllerList[data.room_id][socket_id].pos.x < 0)
      controllerList[data.room_id][socket_id].pos.x = 0
    if (controllerList[data.room_id][socket_id].pos.y < 0)
      controllerList[data.room_id][socket_id].pos.y = 0*/

    this.sendDataToRoom(
      'playerPositions',
      controllerList[data.room_id],
      data.room_id
    )
  },
  connectController(room_id, name, socket_id) {
    if (room_id < 0) return
    if (typeof controllerList[room_id] === 'undefined') {
      controllerList[room_id] = {}
    }
    controllerList[room_id][socket_id] = {
      pos: {
        x: 200,
        y: 200
      },
      dir: 0,
      name: name,
      bullet_amount: 0,
      lastBulletTime: 0,
      hp: 100,
      score: 0
    }

    this.sendDataToRoom('playerPositions', controllerList[room_id], room_id)
  },
  removeController(socket_id) {
    for (let room_id in controllerList) {
      if (typeof controllerList[room_id][socket_id] !== 'undefined') {
        delete controllerList[room_id][socket_id]

        this.sendDataToRoom('playerPositions', controllerList[room_id], room_id)
        return
      }
    }
  },
  updateBullets() {
    let maxBulletFrames = 70
    let bulletSpeed = 10
    for (let room_id in bulletList) {
      for (let i in bulletList[room_id]) {
        // remove old bullets
        if (++bulletList[room_id][i].frame > maxBulletFrames) {
          // add available bullet to user if he's still online

          let socket_id = bulletList[room_id][i].socket_id
          console.log('Bullet kill socket' + socket_id)
          console.log(controllerList[room_id][socket_id])
          if (
            typeof controllerList[room_id] !== 'undefined' &&
            typeof controllerList[room_id][socket_id] !== 'undefined'
          ) {
            console.log('removing bullet amount')
            controllerList[room_id][socket_id].bullet_amount -= 1
          }
          // remove the bullet from the list
          bulletList[room_id].splice(i, 1)
        } else {
          // update bullet position
          let dx = Math.cos(bulletList[room_id][i].dir) * bulletSpeed
          let dy = Math.sin(-bulletList[room_id][i].dir) * bulletSpeed

          bulletList[room_id][i].pos.x += dx
          bulletList[room_id][i].pos.y += dy

          this.checkBulletCollission(room_id, i)
        }
      }
    }
    // send bullets to rooms
    for (let room_id in bulletList) {
      if (bulletList[room_id].length > 0)
        this.sendDataToRoom('bulletListUpdate', bulletList[room_id], room_id)
    }
  },
  checkBulletCollission(room_id, bulletNumber) {
    let playerSize = {
      x: 40,
      y: 40
    }
    let bulletRadius = 5
    let bulletDamage = 15

    let bullet = bulletList[room_id][bulletNumber]
    for (let socket_id in controllerList[room_id]) {
      // check if bullet colliding
      if (
        bullet.socket_id !== socket_id &&
        bullet.pos.x + bulletRadius >=
          controllerList[room_id][socket_id].pos.x - playerSize.x/2 &&
        bullet.pos.x - bulletRadius <=
          controllerList[room_id][socket_id].pos.x + playerSize.x/2 &&
        bullet.pos.y + bulletRadius >=
          controllerList[room_id][socket_id].pos.y - playerSize.y/2 &&
        bullet.pos.y - bulletRadius <=
          controllerList[room_id][socket_id].pos.y + playerSize.y/2
      ) {
        controllerList[room_id][socket_id].hp -= bulletDamage

        // remove the bullet
        bulletList[room_id].splice(bulletNumber, 1)
        // add bullet to user of bullet
        controllerList[room_id][bullet.socket_id].bullet_amount--

        // reset position if dead & add point
        if (controllerList[room_id][socket_id].hp <= 0) {
          controllerList[room_id][socket_id].hp = 100
          controllerList[room_id][socket_id].pos.x = 200
          controllerList[room_id][socket_id].pos.y = 200

          // add points to killer
          controllerList[room_id][bullet.socket_id].score++
        }

        return
      }
    }
  }
}
