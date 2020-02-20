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
  info = JSON.parse(inf)
  let area = document.getElementById('textDisplay')
  let summary = document.getElementById('summary')
  summary.innerHTML =
    'Time Diff:' +
    -info[socket.id].avgDelta +
    '\nPing: ' +
    info[socket.id].avgPing +
    '\nWorld Diff: ' +
    (info['server'].deltaTime + info[socket.id].avgDelta) +
    '\nServer Diff: ' +
    info['server'].deltaTime
  area.innerHTML = JSON.stringify(JSON.parse(inf), null, 4)
})

function start() {
  console.log('sending data')
  socket.emit('startSync', '')
}

function updateTime() {
  let timeElem = document.getElementById('time')
  let time = new Date(
    Date.now() +
      (info[socket.id] ? info[socket.id].avgDelta + info['server'].deltaTime : 0)

  )
  timeElem.innerText = time.getSeconds() + '.' + time.getMilliseconds()
}

setInterval(updateTime, 5)
