let c = document.getElementById('game')
c.width = 600
c.height = 600
let ctx = c.getContext('2d')

let running = false

const maxFPS = 60

let radius = 150
let direction = 0 // up
let step = Math.PI / 60
let startTime = null
let animationType = 0 // 0 requestAnimationFrame, 1 setTimeout, 2 setInterval

let interval = null

let data = {
  fps1: 0,
  fps2: 0
}

function updatePos() {
  direction += step
}
function getPos(dir) {
  let r = radius * (0.6 + Math.random() * 0.4)
  let x = Math.cos(dir) * r + c.width / 2
  let y = Math.sin(dir) * r + c.width / 2
  return { x: x, y: y }
}

let circleAmount = 1000
let activateBinary = false

let long = true

let frames = 0

function anim(timeStamp) {
  if (!startTime) {
    startTime = timeStamp
  }

  let time = timeStamp - startTime

  if (long && activateBinary) {
    circleAmount /= 5
    data.timeLong = time
  } else if (activateBinary) {
    circleAmount *= 5
    data.timeShort = time
  }
  updatePos()
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.arc(getPos(direction).x, getPos(direction).y, 30, 0, 2 * Math.PI, false)
  ctx.fill()
  ctx.fillStyle = 'red'
  ctx.beginPath()
  ctx.arc(
    c.width - getPos(direction).x,
    getPos(direction).y,
    30,
    0,
    2 * Math.PI,
    false
  )
  ctx.fill()

  long = !long
  for (let i = 1; i < circleAmount + 1; i++) {
    ctx.fillStyle = '#' + ((i * 20) % 2000).toString(16)
    ctx.beginPath()
    let pos = getPos(direction + step * 2 * i)
    ctx.arc(c.width - pos.x, pos.y, 30, 0, 2 * Math.PI, false)
    ctx.fill()
  }
  ctx.textAlign = 'center'
  ctx.font = '30px Arial'
  ctx.fillText(frames.toString(), c.width / 2, c.height / 2)
  frames++
  ctx.fillText(Math.round(time).toString(), c.width / 2, c.height / 2 + 30)
  ctx.fillText(
    Math.round((frames / time) * 1000).toString() + ' FPS',
    c.width / 2,
    c.height / 2 - 30
  )

  //setTimeout(anim, 1000 / 60)
  if (activateBinary) {
    if (!long) {
      //data.fps1 = (frames / time) * 1000
      data.fps1 = 1.0 / (time - data.timeShort)
    } else {
      //data.fps2 = (frames / time) * 1000
      data.fps2 = 1.0 / (time - data.timeShort)
    }
  } else {
    data.fps1 = (frames / time) * 1000
  }

  // draw all
  let dl = document.getElementById('dataList')
  dl.innerHTML = ''

  for (let key in data) {
    dl.innerHTML += '<li>' + key + ': ' + Math.round(data[key]) + '</li>'
  }

  if (running) {
    switch (animationType) {
      case 0:
        requestAnimationFrame(anim)
        break
      case 1:
        setTimeout(anim, 1000 / maxFPS, Date.now())
    }
  } else {
    startTime = null
    frames = 0
    if(interval !== null) {
      clearInterval(interval)
    }
  }
}




function start() {
  if (running) {
    running = false
  } else {
    running = true
    switch (animationType) {
      case 0:
        anim(0)
        break
      case 1:
        setTimeout(anim, 1000 / maxFPS, Date.now())
        break
      case 2:
        interval = setInterval(anim, 1000 / maxFPS, Date.now())
        break
    }
  }
}

function setCircles(val) {
  circleAmount = parseInt(val)
}
function setDivided(val) {
  activateBinary = val
}
function setAnimType(val) {
  console.log(val)
  switch (val) {
    case '0':
      animationType = 0
      break
    case '1':
      animationType = 1
      break
    case '2':
      animationType = 2
      break
    default:
      break
  }
}

//setInterval(anim, 1000 / 60)
