export default class DetectionDrawer {
  constructor(canvas, screen, borderWidth) {
    this.w = screen.width
    this.h = screen.height
    this.borderWidth = borderWidth
    this.c1 = '#00ff00'
    this.c2 = '#0000ff'
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

  drawBorder() {
    let ctx = this.ctx
    ctx.beginPath()
    ctx.fillStyle = this.c1
    ctx.rect(0, 0, this.w, this.borderWidth)
    ctx.rect(0, 0, this.borderWidth, this.h - this.borderWidth)
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = this.c2
    ctx.rect(this.w - this.borderWidth, this.borderWidth, this.w, this.h)
    ctx.rect(0, this.h - this.borderWidth, this.w, this.h)
    ctx.fill()
    ctx.beginPath()
    ctx.lineWidth = this.borderWidth / 2
    ctx.strokeStyle = this.c1
    ctx.strokeRect(
      this.borderWidth / 4,
      this.borderWidth / 4,
      this.w - this.borderWidth / 2,
      this.h - this.borderWidth / 2
    )
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
    ctx.fillStyle = this.c1
    let w = lineWidth * Math.cos(Math.atan(this.h / this.w)) * 1.3
    let h = (this.h * w) / this.w
    ctx.moveTo(this.w / 2 - w, this.h / 2)
    ctx.lineTo(this.w / 2 + w, this.h / 2)
    ctx.lineTo(this.w / 2, this.h / 2 - h)
    ctx.lineTo(this.w / 2 - w, this.h / 2)
    ctx.closePath()
    ctx.fill()

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

  barcode(code, sections) {
    //Only integers are allowed because otherwise the barcode is not complete at the end.
    sections = Math.round(sections)

    const ctx = this.ctx
    code = code
      .toString()
      .split('')
      .map(val => parseInt(val - 1))

    const barWidth = this.w / sections / 6
    //const amountOfIterations = Math.floor((this.w - 2 * this.borderWidth) / (6 * width))

    for (let i = 0; i < sections * 6; i += 6) {
      for (let j = 0; j < 5; j++) {
        ctx.beginPath()
        ctx.fillStyle = this.barcodeColorValues[code[j]]
        ctx.rect(barWidth * (i + j), 0, barWidth, this.h)
        ctx.fill()
      }
      ctx.beginPath()
      ctx.fillStyle = '#ffffff'
      ctx.rect(barWidth * (i + 5), 0, barWidth, this.h)
      ctx.fill()
    }

    this.drawX(40)

    return barWidth
  }

  barcodeOld(code, sections) {
    //Only integers are allowed because otherwise the barcode is not complete at the end.
    sections = Math.round(sections)

    this.clearBarcode()

    const ctx = this.ctx
    code = code
      .toString()
      .split('')
      .map(val => parseInt(val - 1))

    const netWidth = this.w - 2 * this.borderWidth
    const barWidth = netWidth / sections / 6
    //const amountOfIterations = Math.floor((this.w - 2 * this.borderWidth) / (6 * width))

    for (let i = 0; i < sections * 6; i += 6) {
      for (let j = 0; j < 5; j++) {
        ctx.beginPath()
        ctx.fillStyle = this.barcodeColorValues[code[j]]
        ctx.rect(
          this.borderWidth + barWidth * (i + j),
          this.borderWidth,
          barWidth,
          this.h - 2 * this.borderWidth
        )
        ctx.fill()
      }
    }

    return barWidth
  }
}
