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
    platform: navigator.platform,
    browser: getBrowser()
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
      (info[socket.id]
        ? info[socket.id].avgDelta + info['server'].deltaTime
        : 0)
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
  var isIE = /*@cc_on!@*/ false || !!document.documentMode
  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia
  // Chrome 1 - 79
  var isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)
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

setInterval(updateTime, 5)
