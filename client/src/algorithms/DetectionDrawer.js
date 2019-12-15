//cyan #00ffff
//pink '#ff00b6'
export default class DetectionDrawer {
  constructor(canvas, screen, borderWidth) {
    this.w = screen.width
    this.h = screen.height
    this.borderWidth = borderWidth
    this.c1 = '#0000ff'
    this.c2 = '#00ff00'
    this.canvas = canvas
    this.canvas.width = this.w
    this.canvas.height = this.h
    this.barcodeColorValues = ['#000000', '#ffffff']
    this.ctx = this.canvas.getContext('2d')
  }

  drawBorder(l) {
    let ctx = this.ctx
    ctx.beginPath()
    ctx.fillStyle = this.c1
    ctx.rect(0, 0, this.w, l)
    ctx.rect(0, 0, l, this.h / 2)
    ctx.rect(this.w - l, 0, l, this.h / 2)
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = this.c2
    ctx.rect(0, this.h - l, this.w, l)
    ctx.rect(0, this.h / 2, l, this.h / 2)
    ctx.rect(this.w - l, this.h / 2, l, this.h / 2)
    ctx.fill()
  }

  drawX(l) {
    let lineWidth = l
    let circleRadius = lineWidth * 1.2

    let ctx = this.ctx
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.strokeStyle = this.c1
    ctx.moveTo(0, 0)
    ctx.lineTo(this.w / 2, this.h / 2)
    ctx.lineTo(this.w, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = this.c2
    ctx.moveTo(0, this.h)
    ctx.lineTo(this.w / 2, this.h / 2)
    ctx.lineTo(this.w, this.h)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = '#ff0000'
    ctx.arc(this.w / 2, this.h / 2, circleRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  clearBarcode() {
    const ctx = this.ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      this.borderWidth,
      this.borderWidth,
      this.w - 2 * this.borderWidth,
      this.h - 2 * this.borderWidth
    )
  }

  barcode(clientNb, sections) {
    //Only integers are allowed because otherwise the barcode is not complete at the end.
    const ctx = this.ctx
    let code = []
    let even = false
    let amount = 0
    if (clientNb % 2 === 0){
      even = true
    }
    if (even) {
      amount = clientNb / 2 + 2
    } else {
      amount = Math.round((clientNb + 2) / 2)
    }
    for (let i = 0; i < amount; i++) {
      if(even){
        code.push(1)
      } else{
        code.push(0)
      }
      even = !even
    }
    console.log(code)
    const barAmount = (sections*code.length)+(sections+1)
    const barWidth = (this.canvas.width - 2 * this.borderWidth) / barAmount
    let startAt = this.borderWidth

    ctx.beginPath()
    ctx.fillStyle = '#00ffff'
    ctx.rect(startAt, 0, barWidth, this.h)
    ctx.fill()
    startAt += barWidth

    //const amountOfIterations = Math.floor((this.w - 2 * this.borderWidth) / (6 * width))
    for (let i = 0; i < sections * (code.length + 1); i += (code.length + 1)) {
      for (let j = 0; j < code.length; j++) {
        ctx.beginPath()
        ctx.fillStyle = this.barcodeColorValues[code[j]]
        ctx.rect(startAt, 0, barWidth, this.h)
        ctx.fill()
        startAt += barWidth
        ctx.beginPath()
      }
      ctx.beginPath()
      ctx.fillStyle = '#00ffff'
      ctx.rect(startAt, 0, barWidth, this.h)
      ctx.fill()
      startAt += barWidth
    }

    this.drawX(this.borderWidth, barWidth)
    this.drawBorder(this.borderWidth)

    return barWidth
  }
}
