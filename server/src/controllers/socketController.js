
module.exports = (io) => {
	io.on('connect', (socket) => {
		console.log('client connected')
		io.compress(true).emit('data', {
			message: 'welcome to the server'
		})

		socket.on('message', (message) => {
			console.log('client message: ' + message)
		})


		socket.on('disconnect', () => {
			console.log('client disconnected')
		})
	})
}