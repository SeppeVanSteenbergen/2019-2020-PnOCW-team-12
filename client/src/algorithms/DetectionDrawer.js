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
    this.barcodeColorValues = ['#000000', '#545454']
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
    const sepSize = 10
    let codeString = clientNb.toString(2)
    let code = []
    for (let i = 0; i < codeString.length; i++) {
      code.push(codeString.charAt(i))
    }
    console.log(code)



    const codeWidth = (this.canvas.width - 3*this.borderWidth) / sections;
    const barWidth = codeWidth/code.length
    let startAt = this.borderWidth

    //const amountOfIterations = Math.floor((this.w - 2 * this.borderWidth) / (6 * width))
    ctx.beginPath();
    ctx.fillStyle = "#ffffff"
    ctx.rect(startAt, 0, barWidth,
        this.h);
    ctx.fill()
    startAt += barWidth
    for (let i = 0; i < sections * (code.length + 1); i += (code.length + 1)) {
      for (let j = 0; j < code.length; j++) {
        ctx.beginPath()
        ctx.fillStyle = this.barcodeColorValues[code[j]]
        ctx.rect(startAt, 0, barWidth, this.h)
        ctx.fill()
        startAt += barWidth
        ctx.beginPath();
        ctx.fillStyle = "#ffffff"
        ctx.rect(startAt, 0, barWidth,
            this.h);
        ctx.fill()
        startAt += barWidth
      }

      ctx.beginPath()
      ctx.fillStyle = '#a8a8a8'
      ctx.rect(startAt, 0, barWidth, this.h)
      ctx.fill()
      startAt += 2 * barWidth
    }

    this.drawX(this.borderWidth, barWidth)
    this.drawBorder(this.borderWidth)

    return barWidth
  }
}
