const socket = io()

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

socket.on('info', info => {
  let area = document.getElementById('textDisplay')
  area.innerHTML = JSON.stringify(JSON.parse(info), null, 4)
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
