const dataHelper = require('../helpers/dataHelper')
const socketHelper = require('../helpers/socketHelper')

// TODO Datastructure problem: Need to give an integer id to a client in a room

/*

the connected clients have a format
key: user_id
{
	socket_id:
	room:  (-1 not in room, >= 0 in a room)
	(connected: (possible to know if socket_id exists))
	disconnect_time: (time/date when the client was last connected, -1 if still connected, time/date if disconnected),
	size: {
	                width: (screen width in pixels)
	                height: (screen height in pixels)
	              }
}
*/
clientList = {}

/*
dictionary
key: room_id

value:
{
	master: (user_id of master)
	clients:[] (user_id list of all clients of room)
	name: (name of the room)
	open: (true if open room, false if closed room)
}
*/
roomList = {}

/*
  contains the user_id + challenge password to register a socket

  List
  [{
    user_id:
    key:
  }, ...]
 */
registrationList = []

/*
  dictionary containing all the client pings

  Dict
  {
    room_id: {
      user_id: {
        ping: [ping in ms],
        timeDelta: [time in ms]
        }
      user_id2: {..}
    }
   }
 */
pingList = {}

/**
 * contains all the controller information
 *  {
 *    room_id: {
 *      socket_id: {   // this defines a player
 *        name:   // optional given name
 *        pos: {
 *          x:
 *          y:
 *        },
 *        dir:    // direction
 *        bullet_amount: 0   // amount of bullets the player has in the screen
 *        hp:   // 100 is max
 *        score:  // how many points player has
 *      }
 *    }
 *  }
 */
controllerList = {}

/**
 * {
 *   room_id: [
 *     bullet {
 *       pos: {
 *         x:,
 *         y:
 *       },
 *       dir:    // direction
 *       frame:   // how many frames the bullet existed
 *       socket_id:  // id of the socket the bullet is from
 *     },
 *     ...
 *   ]
 * }
 *
 */
bulletList = {}

let bulletUpdateTimeout = 18


setInterval(socketHelper.updateBullets.bind(socketHelper), bulletUpdateTimeout)

module.exports = io => {
  io.on('connect', socket => {
    console.log('client connected')

    socketHelper.updateAllRoomLists()

    socket.use((packet, next) => {
      if (
        packet[0] !== 'registerUserSocket' &&
        !dataHelper.isRegisteredSocket(socket.id)
      ) {
        console.log('socket not registered')
        next(new Error('socket not registered'))
      } else {
        next()
      }
    })

    io.compress(true).emit('data', {
      message: 'welcome to the server'
    })

    socket.on('message', message => {
      console.log('client message: ' + message)
    })

    socket.on('disconnect', () => {
      /*try{
        dataHelper.removeUser(dataHelper.getUserIDFromSocketID(socket.id))
      } catch(e) {
        console.log(e)
      }*/
      console.log('client disconnected')
      socketHelper.updateAllRoomLists()

      socketHelper.removeController(socket.id)
    })

    socket.on('registerUserSocket', data => {
      console.log('starting user registration')
      console.log(registrationList)
      console.log(data)
      /*if(dataHelper.validRegistration(data.user_id, data.key)) {
        console.log('successfull registration')
        dataHelper.registerUserSocket(data.user_id, socket.id)
        socketHelper.sendSuccessMessageToSocket(socket.id, 'Successfully registered socket')
      } else {
        console.log('failed registration')
        socketHelper.sendErrorMessageToSocket(socket.id, 'Failed to register socket')
      }*/
      if (dataHelper.registerUserSocket(data.user_id, socket.id)) {
        // dataHelper.removeUser(data.user_id)
        dataHelper.disableSocket(data.user_id)
        // socketHelper.disconnectSocket(socket.id)
        dataHelper.registerUserSocket(data.user_id, socket.id)
      }
    })

    socket.on('createRoom', () => {
      console.log('creating room')
      console.log(dataHelper.getUserIDFromSocketID(socket.id))
      dataHelper.createRoom(dataHelper.getUserIDFromSocketID(socket.id))
      socketHelper.updateAllRoomLists()
    })

    socket.on('updateRoomList', () => {
      socketHelper.updateRoomList(socket.id)
    })

    socket.on('exitRoom', () => {
      console.log('exiting room')
      try {
        dataHelper.exitRoom(dataHelper.getUserIDFromSocketID(socket.id))
      } catch (e) {
        console.log(e)
      }

      socketHelper.updateAllRoomLists()
    })

    socket.on('joinRoom', room_id => {
      dataHelper.addClientToRoom(
        dataHelper.getUserIDFromSocketID(socket.id),
        room_id
      )
      socketHelper.updateAllRoomLists()
    })

    socket.on('screenCommand', command => {
      socketHelper.screenCommand(
        dataHelper.getUserIDFromSocketID(socket.id),
        command
      )
    })

    socket.on('closeRoom', () => {
      socketHelper.closeRoom(dataHelper.getUserIDFromSocketID(socket.id))
    })

    socket.on('openRoom', () => {
      socketHelper.openRoom(dataHelper.getUserIDFromSocketID(socket.id))
    })

    socket.on('toggleRoom', () => {
      console.log(roomList)
      socketHelper.toggleRoom(dataHelper.getUserIDFromSocketID(socket.id))
      console.log(roomList)
    })

    /**
     * Get the information related to the clients connected to the room
     */
    socket.on('getClientInfo', () => {
      socketHelper.sendClientInfo(dataHelper.getUserIDFromSocketID(socket.id))
    })

    /**
     * Set the screen size of a connected device
     */
    socket.on('setScreenSize', data => {
      dataHelper.setSize(dataHelper.getUserIDFromSocketID(socket.id), data.size)
    })

    socket.on('updateRoomClientInfo', () => {
      socketHelper.updateRoomClientInfo(
        dataHelper.getUserIDFromSocketID(socket.id)
      )
    })

    socket.on('pongs', data => {
      console.log('received PONG !!')
      console.log(pingList)
      socketHelper.pong(dataHelper.getUserIDFromSocketID(socket.id), data)
    })

    socket.on('startSync', () => {
      console.log('starting synchronisation')
      socketHelper.syncRoomOfMaster(dataHelper.getUserIDFromSocketID(socket.id))
    })

    socket.on('af', data => {
      socketHelper.animationFrame(
        dataHelper.getUserIDFromSocketID(socket.id),
        data
      )
    })

    socket.on('move', data => {
      socketHelper.updateSendControllerData(data, socket.id)
    })

    socket.on('connectController', data => {
      socketHelper.removeController(socket.id)
      socketHelper.connectController(data.room_id,data.name, socket.id)
    })
  })
}
