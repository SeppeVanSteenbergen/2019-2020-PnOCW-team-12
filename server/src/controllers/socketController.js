const dataHelper = require('../helpers/dataHelper')
const socketHelper = require('../helpers/socketHelper')

/*

the connected clients have a format
key: user_id
{
	socket_id:
	room:  (-1 not in room, >= 0 in a room)
	(connected: (possible to know if socket_id exists))
	disconnect_time: (time/date when the client was last connected, -1 if still connected, time/date if disconnected)
}
*/
clientList = {}

/*
dictionary
key: room_id

value:
{
	master: (user_id of master)
	clients:[] (user_id list of all clients of rooom)
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

module.exports = io => {
  io.on('connect', socket => {
    console.log('client connected')

    socketHelper.updateAllRoomLists()

    io.compress(true).emit('data', {
      message: 'welcome to the server'
    })

    socket.on('message', message => {
      console.log('client message: ' + message)
    })

    socket.on('disconnect', () => {
      try{
        dataHelper.removeUser(dataHelper.getUserIDFromSocketID(socket.id))
      } catch(e) {
        console.log(e)
      }
      console.log('client disconnected')
      socketHelper.updateAllRoomLists()
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
      if(dataHelper.registerUserSocket(data.user_id, socket.id)) {
        dataHelper.removeUser(data.user_id)
        socketHelper.disconnectSocket(socket.id)
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
      } catch(e) {
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

    /////////////////////////////////////
    //////////// COMMANDS ///////////////
    /////////////////////////////////////

    //////////////////////////////////////
    ///////////// END COMMANDS ///////////
    ///////////////////////////////////////
  })
}
