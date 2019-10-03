
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

module.exports = (io) => {
	io.on('connect', (socket) => {
		console.log('client connected')

		socketHelper.updateAllRoomLists()

		io.compress(true).emit('data', {
			message: 'welcome to the server'
		})

		socket.on('message', (message) => {
			console.log('client message: ' + message)
		})


		socket.on('disconnect', () => {
			console.log('client disconnected')
		})

		socket.on('registerUserSocket', (user_id) => {
			dataHelper.registerUserSocket(user_id, socket.id)
		})

		socket.on('createRoom', () => {
			dataHelper.createRoom(dataHelper.getUserIDFromSocketID(socket.id))
			socketHelper.updateAllRoomLists()
		})

		socket.on('updateRoomList', () => {
			socketHelper.updateRoomList(socket.id)
		})

		socket.on('exitRoom', () => {
			console.log('exiting room')
			dataHelper.exitRoom(dataHelper.getUserIDFromSocketID(socket.id))
			socketHelper.updateAllRoomLists()
		})

		socket.on('joinRoom', (room_id) => {
			dataHelper.addClientToRoom(dataHelper.getUserIDFromSocketID(socket.id), room_id)
			socketHelper.updateAllRoomLists()
		})
	})
}