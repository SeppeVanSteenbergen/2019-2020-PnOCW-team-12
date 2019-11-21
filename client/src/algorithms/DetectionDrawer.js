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
    this.barcodeColorValues = [
      '#ff0000',
      '#ffff00',
      '#00ff00',
      '#0000ff',
      '#ff00ff'
    ]
    this.ctx = this.canvas.getContext('2d')
  }

  drawBorder(l) {
    let ctx = this.ctx
    let cornersize = this.w * 0.1
    let h = this.h * 0.1

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

  drawX(l, space) {
    let lineWidth = l
    let circleRadius = lineWidth * 1.2

    let ctx = this.ctx
    ctx.lineWidth = lineWidth + 2 * space
    ctx.beginPath()
    ctx.strokeStyle = '#ffffff'
    ctx.moveTo(0, 0)
    ctx.lineTo(this.w / 2, this.h / 2)
    ctx.lineTo(this.w, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = '#ffffff'
    ctx.moveTo(0, this.h)
    ctx.lineTo(this.w / 2, this.h / 2)
    ctx.lineTo(this.w, this.h)
    ctx.stroke()
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
    ctx.fillStyle = '#00ffff'
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

  clearScreen() {
    const ctx = this.ctx
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
        0,
        0,
        this.w,
        this.h
    )
  }

  barcode(code, sections) {
    //Only integers are allowed because otherwise the barcode is not complete at the end.
    sections = Math.round(sections)
    this.clearScreen()

    const ctx = this.ctx
    code = code
      .toString()
      .split('')
      .map(val => parseInt(val - 1))

    const barWidth = (this.w - 2 * this.borderWidth) / (sections * 6 + 1)

    //const amountOfIterations = Math.floor((this.w - 2 * this.borderWidth) / (6 * width))

    for (let i = 0; i < sections * 6; i += 6) {
      for (let j = 0; j < 5; j++) {
        ctx.beginPath()
        ctx.fillStyle = this.barcodeColorValues[code[j]]
        ctx.rect(
          barWidth * (i + j) + this.borderWidth + barWidth,
          this.borderWidth + barWidth,
          barWidth,
          this.h - 2 * this.borderWidth - 2 * barWidth
        )
        ctx.fill()
      }
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.rect(
        barWidth * (i + 5) + this.borderWidth + barWidth,
        this.borderWidth,
        barWidth,
        this.h - 2 * this.borderWidth
      )
      ctx.fill()
    }

    this.drawX(this.borderWidth, barWidth)
    this.drawBorder(this.borderWidth)

    return barWidth
  }
}
