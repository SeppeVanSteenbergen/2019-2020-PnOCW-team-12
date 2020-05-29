const axios = require('axios')

socketList = {}

const amountOfPings = 10

module.exports = io => {
  io.on('connect', socket => {
    console.log('connected + ' + socket.id)
  })
}
