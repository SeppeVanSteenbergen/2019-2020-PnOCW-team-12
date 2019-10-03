const dataHelper = require('./dataHelper')
const io = require('../app').io

module.exports = {
	updateAllRoomLists(){
		console.log('updating all roomlists')
		const activeSocketIDs = dataHelper.getAllActiveSocketIDs()
		for(let i = 0; i < activeSocketIDs.length; i++) {
			io.to(activeSocketIDs[i]).emit('ROOMLISTUPDATE', dataHelper.getRoomList())
		}

		console.log(roomList)
	},
	updateRoomList(socket_id) {
		console.log('update room list')
		io.to(socket_id).emit('ROOMLISTUPDATE', dataHelper.getRoomList())
	},

	getSocketFromID(socket_id) {
		return io.eio.clients[socket_id]
	}
}