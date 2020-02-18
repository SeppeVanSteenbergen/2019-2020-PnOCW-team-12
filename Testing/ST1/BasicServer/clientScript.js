const socket = io()
let info = {}

socket.on('connect', () => {
  socket.send('data', 'okay')
})

socket.on('pings', TS1 => {
  const TC1 = Date.now()
  const D = TC1 - TS1

  const TC2 = Date.now()
  console.log('got ping message')
  socket.emit('pongs', {
    TC2: TC2,
    TC1: TC1,
    TS1: TS1,
    D: D
  })
})

socket.on('getSystemInfo', () => {
  socket.emit('systemInfo', {
    platform: navigator.platform
  })
})

socket.on('info', inf => {
  info = inf
  let area = document.getElementById('textDisplay')
  let summary = document.getElementById('summary')
  summary.innerHTML = 'Time Diff:' + JSON.parse(inf)[socket.id].avgDelta + '\nPing: ' + JSON.parse(inf)[socket.id].avgPing
  area.innerHTML = JSON.stringify(JSON.parse(inf), null, 4)
})

function start() {
  console.log('sending data')
  socket.emit('startSync', '')
}

function getOS() {
  var ua = navigator.userAgent.toLowerCase()
  if (ua.indexOf('win') != -1) {
    return 'Windows'
  } else if (ua.indexOf('mac') != -1) {
    return 'Macintosh'
  } else if (ua.indexOf('linux') != -1) {
    return 'Linux'
  } else if (ua.indexOf('x11') != -1) {
    return 'Unix'
  } else {
    return 'Computers'
  }
}

function updateTime() {
  let timeElem = document.getElementById('time')
  let time = new Date(
    Date.now() - (info.avgDelta ? info.avgDelta : 0)
  )
  timeElem.innerText =
    time.getSeconds() +
    '.' +
    time.getMilliseconds()
}

setInterval(updateTime, 10)
