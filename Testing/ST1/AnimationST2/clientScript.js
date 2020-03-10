const socket = io()
let info = {}

let c = document.getElementById('game')
let ctx = c.getContext('2d')

let avgDelta = 0

socket.on('connect', () => {
  socket.send('data', 'okay')
})

socket.on('pings', TS1 => {
  const TC1 = Date.now()
  const D = TC1 - TS1

  const TC2 = Date.now()
  //console.log('got ping message')
  socket.emit('pongs', {
    TC2: TC2,
    TC1: TC1,
    TS1: TS1,
    D: D
  })
})

socket.on('getSystemInfo', () => {
  socket.emit('systemInfo', {
    platform: navigator.platform,
    browser: getBrowser()
  })
})

socket.on('info', inf => {
  info = JSON.parse(inf)
  let area = document.getElementById('textDisplay')
  let summary = document.getElementById('summary')
  avgDelta = -info[socket.id].avgDelta
  summary.innerHTML =
    'Time Diff:' +
    -info[socket.id].avgDelta +
    '\nPing: ' +
    info[socket.id].avgPing +
    '\nPlatform: ' +
    info[socket.id].system.platform
  //area.innerHTML = JSON.stringify(JSON.parse(inf), null, 4)
})

function start() {
  //console.log('sending data')
  socket.emit('startSync', '')
}

function updateTime() {
  let timeElem = document.getElementById('time')
  let time = new Date(
    Date.now() + (info[socket.id] ? info[socket.id].avgDelta : 0)
  )
  timeElem.innerText = time.getSeconds() + '.' + time.getMilliseconds()
}

function getBrowser() {
  var isOpera =
    (!!window.opr && !!opr.addons) ||
    !!window.opera ||
    navigator.userAgent.indexOf(' OPR/') >= 0
  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined'
  // Safari 3.0+ "[object HTMLElementConstructor]"
  var isSafari =
    /constructor/i.test(window.HTMLElement) ||
    (function(p) {
      return p.toString() === '[object SafariRemoteNotification]'
    })(
      !window['safari'] ||
        (typeof safari !== 'undefined' && safari.pushNotification)
    )
  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/ !!document.documentMode
  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia
  // Chrome 1 - 79
  //var isChrome =
  // !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
  var isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  // Edge (based on chromium) detection
  var isEdgeChromium = isChrome && navigator.userAgent.indexOf('Edg') != -1

  if (isOpera) return 'Opera'
  if (isFirefox) return 'Firefox'
  if (isSafari) return 'Safari'
  if (isIE) return 'IE'
  if (isEdge) return 'Edge'
  if (isChrome) return 'Chrome'
  if (isEdgeChromium) return 'EdgeChromium'
  return 'Unknown'
}

function getServerTime() {
  return Date.now() - avgDelta //TODO: + or - delta???
}
let animID = null
socket.on('startAnimation', data => {
  animationStartTime = data.startTime
  frameCount = 0
  if (animID !== null) cancelAnimationFrame(animID)
  startAnimation()
})

let animationStartTime = null
let speed = 10
let frameNum = 0
let limitFrameCount = 180
let startTime = null

let state = {
  x: 0,
  y: 0,
  deg: 0
}
let state2 = {
  x: 0,
  y: 0,
  deg: 0
}

function resetAnimation() {
  c.width = 600
  c.height = 600
  ctx.clearRect(0, 0, 600, 600)
  state.x = 100
  state.y = 100
  state.deg = 0
}
function calcAnimationData() {
  if (getServerTime() < animationStartTime) return
  if (startTime === null) {
    startTime = performance.now()
  }
  if (frameCount === limitFrameCount) {
    document.getElementById('timing').innerText = (
      performance.now() - startTime
    ).toString()
  }
  // total of 1200
  //frameNum = Math.round((getServerTime() * 0.5) % 1200)
  frameNum = (frameNum + speed) % 1200
  state2 = getStateFromFrame(frameNum >= 600 ? frameNum - 600 : frameNum + 600)
  state = getStateFromFrame(frameNum)
}

function getStateFromFrame(frameNum) {
  let s = {
    x: 0,
    y: 0
  }
  if (frameNum < 300) {
    s.x = 100 + frameNum
    s.y = 100
  } else if (frameNum < 600) {
    s.x = 400
    s.y = 100 - 300 + frameNum
  } else if (frameNum < 900) {
    s.x = 400 + 600 - frameNum
    s.y = 400
  } else if (frameNum < 1200) {
    s.x = 100
    s.y = 400 + 900 - frameNum
  }
  return s
}

let frameCount = 0
function drawAnimation() {
  if (frameNum < 400) {
    ctx.fillStyle = 'red'
  } else if (frameNum < 800) {
    ctx.fillStyle = 'blue'
  } else {
    ctx.fillStyle = 'green'
  }
  ctx.fillRect(0, 0, 600, 600)
  ctx.fillStyle = 'black'
  ctx.fillRect(state.x, state.y, 100, 100)
  ctx.fillStyle = 'white'
  ctx.fillRect(state2.x, state2.y, 100, 100)
  ctx.font = '100px Arial'
  ctx.fillText(frameNum.toString(), 200, 300)

  frameCount += 1
  document.getElementById('frameCount').innerText = frameCount
}

function startAnimation() {
  resetAnimation()
  calcAnimationData()
  drawAnimation()
  animID = requestAnimationFrame(startAnimation)
}

function socketAnimation() {
  socket.emit('startAnimation', '')
}

function socketReload() {
  socket.emit('reload', '')
}
socket.on('reload', () => {
  location.reload()
})

setInterval(updateTime, 5)
