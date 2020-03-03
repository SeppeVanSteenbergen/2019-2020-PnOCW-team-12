let c = document.getElementById('game')
c.width = 600
c.height = 600
let ctx = c.getContext('2d')

let radius = 150
let direction = 0 // up
let step = Math.PI / 60

function updatePos() {
  direction += step
}
function getPos(dir) {
  let r = radius * (0.6 + Math.random() * 0.4)
  let x = Math.cos(dir) * r + c.width / 2
  let y = Math.sin(dir) * r + c.width / 2
  return { x: x, y: y }
}

let circleAmount = 10000
let activateBinary = true


let long = true

let text = 0

function anim(time) {
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

  if (long && activateBinary) {
    circleAmount /= 5
  } else if (activateBinary) {
    circleAmount *= 5
  }
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
  ctx.fillText(text.toString(), c.width / 2, c.height / 2)
  text++
  ctx.fillText(Math.round(time).toString(), c.width / 2, c.height / 2 + 30)
  ctx.fillText(
    Math.round((text / time) * 1000).toString() + ' FPS',
    c.width / 2,
    c.height / 2 - 30
  )

  //setTimeout(anim, 1000 / 60)
  requestAnimationFrame(anim)
}

anim(0)

//setInterval(anim, 1000 / 60)
