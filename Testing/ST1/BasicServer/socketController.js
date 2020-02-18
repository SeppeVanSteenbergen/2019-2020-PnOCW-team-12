const io = require('./app.js').io

io.on('connect', socket => {
  socket.on('data', dat => {
    console.log(dat)
  })
})
