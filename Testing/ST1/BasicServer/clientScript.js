const sock = io()

sock.on('connection', socket => {
  socket.send('data', 'okay')
})

function start() {}
