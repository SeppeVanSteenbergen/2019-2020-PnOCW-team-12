const axios = require('axios')
let api = require('./spreadsheet')

socketList = {}

const amountOfPings = 10

module.exports = io => {
  io.on('connect', socket => {
    console.log('connected')

    socket.on('startSync', () => {
      deleteList()
      const socketIDs = Object.keys(io.sockets.sockets)
      console.log('started')
      for (let i = 0; i < socketIDs.length; i++) {
        socketList[socketIDs[i]] = {
          deltas: [],
          pings: []
        }
        getSystemInfo(socketIDs[i])
      }
    })

    socket.on('pongs', dat => {
      const TS2 = Date.now()
      const D2 = dat.TC2 - TS2
      const timeOffset = -(D2 + dat.D) / 2
      const ping = TS2 - dat.TS1 - (dat.TC2 - dat.TC1)
      socketList[socket.id].deltas.push(timeOffset)
      socketList[socket.id].pings.push(ping)
      if (socketList[socket.id].deltas.length === amountOfPings) {
        checkFinished()
      } else {
        pingSocket(socket.id)
      }
    })

    socket.on('systemInfo', info => {
      console.log('got system info')
      console.log(info)
      socketList[socket.id].system = info
      pingSocket(socket.id)
    })
  })

  function pingSocket(socket_id) {
    io.to(socket_id).emit('pings', Date.now())
  }
  function deleteList() {
    socketList = {}
  }
  function checkFinished() {
    for (let socket_id in socketList) {
      if (
        typeof socketList[socket_id].deltas !== 'undefined' &&
        socketList[socket_id].deltas.length !== amountOfPings
      )
        return
    }

    for (let socket_id in socketList) {
      socketList[socket_id].avgDelta =
        socketList[socket_id].deltas.reduce((a, b) => a + b) /
        socketList[socket_id].deltas.length
      socketList[socket_id].avgPing =
        socketList[socket_id].pings.reduce((a, b) => a + b) /
        socketList[socket_id].pings.length
    }

    //console.log(socketList)

    calcServerOffset()
      .then(() => {
        sendInfoToClients()
      })
      .catch(error => {
        console.log(error.message)
      })
  }

  function sendInfoToClients() {
    io.emit('info', JSON.stringify(socketList))

    console.log('UPLOADING ' + Object.keys(socketList).length + ' DEVICES')

    for (let socket_id in socketList) {
      if (socket_id !== 'server') {
        api.addResult(
            'TCP',
            socketList[socket_id].avgDelta + socketList['server'].deltaTime,
            socketList[socket_id].system.platform
        )
      }
    }
  }

  function getSystemInfo(socket_id) {
    io.to(socket_id).emit('getSystemInfo')

  }

  async function calcServerOffset() {
    let result = await axios.get(
      'http://worldtimeapi.org/api/timezone/Europe/Brussels'
    )
    let serverTime = Date.now()
    let worldTime = new Date(result.data.datetime)
    let deltaTime = worldTime - serverTime
    console.log(serverTime)
    console.log(worldTime)
    socketList['server'] = {
      deltaTime: deltaTime
    }
  }
}
