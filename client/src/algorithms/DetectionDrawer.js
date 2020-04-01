//cyan #00ffff
//pink '#ff00b6'
export default class DetectionDrawer {
  constructor(canvas, screen, borderWidth) {
    this.w = screen.width
    this.h = screen.height
    this.borderWidth = borderWidth
    this.c1 = '#ffff00'
    this.c2 = '#ff00ff'
    this.canvas = canvas
    this.canvas.width = this.w
    this.canvas.height = this.h
    this.barcodeColorValues = ['#ffffff', '#000000']
    this.ctx = this.canvas.getContext('2d')

    this.number = 0
    this.options = [
      ['#ff00ff', '#00ffff', '#ffff00'],
      ['#0000ff', '#ff0000', '#00ff00']
    ]
  }

  drawBorder(colors, space) {
    this.clearAll()
    this.drawX(colors, space)

    let ctx = this.ctx

    ctx.beginPath()
    ctx.fillStyle = colors[1]
    ctx.rect(0, 0, this.w, this.borderWidth)
    ctx.rect(0, 0, this.borderWidth, this.h / 2)
    ctx.rect(this.w - this.borderWidth, 0, this.borderWidth, this.h / 2)
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = colors[2]
    ctx.rect(0, this.h - this.borderWidth, this.w, this.borderWidth)
    ctx.rect(0, this.h / 2, this.borderWidth, this.h / 2)
    ctx.rect(
      this.w - this.borderWidth,
      this.h / 2,
      this.borderWidth,
      this.h / 2
    )
    ctx.fill()
  }

  drawX(colors, space) {
    let lineWidth = this.borderWidth
    let circleRadius = lineWidth * 1.2

    let ctx = this.ctx
    ctx.lineWidth = lineWidth + 2 * space
    // ctx.beginPath()
    // ctx.strokeStyle = '#ffffff'
    // ctx.moveTo(0, 0)
    // ctx.lineTo(this.w / 2, this.h / 2)
    // ctx.lineTo(this.w, 0)
    // ctx.stroke()
    // ctx.beginPath()
    // ctx.strokeStyle = '#ffffff'
    // ctx.moveTo(0, this.h)
    // ctx.lineTo(this.w / 2, this.h / 2)
    // ctx.lineTo(this.w, this.h)
    // ctx.stroke()
    // ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.strokeStyle = colors[1]
    ctx.moveTo(0, 0)
    ctx.lineTo((this.w * 1) / 6, (this.h * 1) / 6)
    ctx.moveTo((this.w * 2) / 6, (this.h * 2) / 6)
    ctx.lineTo((this.w * 3) / 6, (this.h * 3) / 6)
    ctx.lineTo((this.w * 4) / 6, (this.h * 2) / 6)
    ctx.moveTo((this.w * 5) / 6, (this.h * 1) / 6)
    ctx.lineTo(this.w, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = colors[2]
    ctx.moveTo(0, this.h)
    ctx.lineTo((this.w * 1) / 6, (this.h * 5) / 6)
    ctx.moveTo((this.w * 2) / 6, (this.h * 4) / 6)
    ctx.lineTo((this.w * 3) / 6, (this.h * 3) / 6)
    ctx.lineTo((this.w * 4) / 6, (this.h * 4) / 6)
    ctx.moveTo((this.w * 5) / 6, (this.h * 5) / 6)
    ctx.lineTo(this.w, this.h)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = colors[0]
    ctx.arc(this.w / 2, this.h / 2, circleRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  clearAll() {
    const ctx = this.ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.w, this.h)
  }

  clearBarcode() {
    const ctx = this.ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.w, this.h)
    this.drawBorder(this.options[this.number], 0)
  }

  barcode(clientNb, sections) {
    //Only integers are allowed because otherwise the barcode is not complete at the end.
    sections = Math.round(sections)

    this.drawBorder(this.options[this.number], 0)

    const ctx = this.ctx

    let code = []
    let value = clientNb % 2 == 0 ? 0 : 1
    for (let i = 0; i < Math.floor(clientNb / 2) + 2; i++) {
      code.push(value)
      value = (value + 1) % 2
    }

    const codeWidth = this.w - 2 * this.borderWidth
    const barWidth = codeWidth / (sections * (code.length + 1) + 1)
    let startAt = this.borderWidth

    ctx.beginPath()
    ctx.fillStyle = '#808080'
    ctx.rect(startAt, this.borderWidth, barWidth, this.h - 2 * this.borderWidth)
    ctx.fill()
    startAt += barWidth

    for (let i = 0; i < sections; i++) {
      for (let j = 0; j < code.length; j++) {
        ctx.beginPath()
        ctx.fillStyle = this.barcodeColorValues[code[j]]
        ctx.rect(
          startAt,
          this.borderWidth,
          barWidth,
          this.h - 2 * this.borderWidth
        )
        ctx.fill()
        startAt += barWidth
      }
      ctx.beginPath()
      ctx.fillStyle = '#808080'
      ctx.rect(
        startAt,
        this.borderWidth,
        barWidth,
        this.h - 2 * this.borderWidth
      )
      ctx.fill()
      startAt += barWidth
    }

    this.drawX(this.options[this.number], 0)

    return barWidth
  }
}
