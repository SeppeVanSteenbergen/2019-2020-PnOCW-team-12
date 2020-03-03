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

  async function sendInfoToClients() {
    io.emit('info', JSON.stringify(socketList))

    console.log('UPLOADING ' + Object.keys(socketList).length + ' DEVICES')

    for (let socket_id in socketList) {
      if (socket_id !== 'server') {
        let minPing = minimum(socketList[socket_id].pings)
        let maxPing = maximum(socketList[socket_id].pings)
        let sdPing = getSD(socketList[socket_id].pings)
        let avgPing = socketList[socket_id].avgPing

        await api.addResult('TCP', {
          time: socketList[socket_id].avgDelta + socketList['server'].deltaTime,
          os: socketList[socket_id].system.platform,
          browser: socketList[socket_id].system.browser,
          minPing: minPing,
          maxPing: maxPing,
          sdPing: sdPing,
          avgPing: avgPing
        })
      }
    }
  }

  function getSystemInfo(socket_id) {
    io.to(socket_id).emit('getSystemInfo')
  }

  async function calcServerOffset() {
    let timeSend = Date.now()
    let result = await axios.get(
      'http://worldtimeapi.org/api/timezone/Europe/Brussels'
    )
    /*let result = await axios.get(
      'http://worldclockapi.com/api/json/cet/now'
    )*/
    /*let result = await axios.get(
      'https://api.collectapi.com/time/timeZone?data.city=brussels',
      {
        headers: {
          Authorization: 'apikey 0XmOD4Rx7qpZEymFhj7ANJ:1Pwp6hp2rxmufmm3RSSe0w'
        }
      }
    )*/
    let serverTime = Date.now()
    let worldTime = new Date(result.data.datetime)
    let ping = serverTime - timeSend
    let deltaTime = worldTime - serverTime + ping / 2
    console.log(serverTime)
    console.log(worldTime)
    socketList['server'] = {
      deltaTime: deltaTime,
      ping: ping
    }
  }

  function getMean(data) {
    return (
      data.reduce(function(a, b) {
        return Number(a) + Number(b)
      }) / data.length
    )
  }

  function getSD(data) {
    let m = getMean(data)
    return Math.sqrt(
      data.reduce(function(sq, n) {
        return sq + Math.pow(n - m, 2)
      }, 0) /
        (data.length - 1)
    )
  }

  function minimum(list) {
    let min = list[0]
    for (let i = 1; i < list.length; i++) {
      if (list[i] < min) min = list[i]
    }
    return min
  }
  function maximum(list) {
    let min = list[0]
    for (let i = 1; i < list.length; i++) {
      if (list[i] > min) min = list[i]
    }
    return min
  }
}
