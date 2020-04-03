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
    this.colors = ['#ff00ff', '#00ffff', '#ffff00']
    this.drawBorder(this.colors)
  }

  drawBorder(colors) {
    this.clearAll()
    //turn background grey

    this.fillStroke(0, 0, this.w, this.h, '#808080')

    this.drawX(colors)

    this.ctx.beginPath()
    this.ctx.fillStyle = colors[1]
    this.ctx.rect(0, 0, this.w, this.borderWidth)
    this.ctx.rect(0, 0, this.borderWidth, this.h / 2)
    this.ctx.rect(this.w - this.borderWidth, 0, this.borderWidth, this.h / 2)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.fillStyle = colors[2]
    this.ctx.rect(0, this.h - this.borderWidth, this.w, this.borderWidth)
    this.ctx.rect(0, this.h / 2, this.borderWidth, this.h / 2)
    this.ctx.rect(
      this.w - this.borderWidth,
      this.h / 2,
      this.borderWidth,
      this.h / 2
    )
    this.ctx.fill()
  }

  drawX(colors) {
    let lineWidth = this.borderWidth
    let circleRadius = lineWidth * 1.2

    let ctx = this.ctx
    ctx.lineWidth = lineWidth

    ctx.beginPath()
    ctx.strokeStyle = colors[1]
    ctx.moveTo(0, 0)
    ctx.lineTo((this.w * 3) / 6, (this.h * 3) / 6)
    ctx.lineTo(this.w, 0)
    ctx.stroke()
    ctx.beginPath()
    ctx.strokeStyle = colors[2]
    ctx.moveTo(0, this.h)
    ctx.lineTo((this.w * 3) / 6, (this.h * 3) / 6)
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
    this.drawBorder(this.colors, 0)
  }

  barcode(clientNb, sections) {
    let code = []
    let value = clientNb % 2 === 0 ? 0 : 1
    for (let i = 0; i < Math.floor(clientNb / 2) + 2; i++) {
      code.push(value)
      value = (value + 1) % 2
    }

    const codeWidth = this.w - 2 * this.borderWidth
    this.barWidth = codeWidth / (sections * (code.length + 1) + 0.5)
    let startAt = this.borderWidth
    let sectionWidth = (this.w - 2 * this.borderWidth) / 6
    let rico1 = -this.h / this.w
    let b1 = -this.borderWidth / (2 * Math.cos(Math.atan(this.h / this.w)))
    let b2 = -b1

    //first section
    let sectionEnd1 = this.borderWidth + sectionWidth - this.barWidth / 2
    let sectionHigh = rico1 * sectionEnd1 + b1
    this.fillStroke(
      startAt,
      -sectionHigh,
      this.barWidth / 2,
      this.h + 2 * sectionHigh,
      '#808080'
    )
    startAt += this.barWidth / 2
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        -sectionHigh,
        this.barWidth,
        this.h + 2 * sectionHigh,
        code[j]
      )
      startAt += this.barWidth
    }
    this.fillStroke(
      startAt,
      -sectionHigh,
      this.barWidth,
      this.h + 2 * sectionHigh,
      '#808080'
    )
    startAt += this.barWidth

    //section 2
    let sectionEnd2 = sectionEnd1 + sectionWidth
    let section2High = rico1 * sectionEnd2 + b1
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        -section2High,
        this.barWidth,
        this.h + 2 * section2High,
        code[j]
      )
      startAt += this.barWidth
    }
    this.fillStroke(
      startAt,
      -section2High,
      this.barWidth,
      this.h + 2 * section2High,
      '#808080'
    )
    startAt += this.barWidth

    // Section 3
    startAt = this.w - startAt
    this.fillStroke(
      startAt,
      -section2High,
      this.barWidth,
      this.h + 2 * section2High,
      '#808080'
    )
    startAt += this.barWidth
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        -section2High,
        this.barWidth,
        this.h + 2 * section2High,
        code[j]
      )
      startAt += this.barWidth
    }

    //section 4
    this.fillStroke(
      startAt,
      -sectionHigh,
      this.barWidth,
      this.h + 2 * sectionHigh,
      '#808080'
    )
    startAt += this.barWidth
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        -sectionHigh,
        this.barWidth,
        this.h + 2 * sectionHigh,
        code[j]
      )
      startAt += this.barWidth
    }
    this.fillStroke(
      startAt,
      -sectionHigh,
      this.barWidth / 2,
      this.h + 2 * sectionHigh,
      '#808080'
    )

    //first up and down section
    startAt = this.borderWidth + sectionWidth + this.barWidth / 2
    let sectionUpHigh = rico1 * (startAt - 2 * this.barWidth) + b2
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        this.borderWidth,
        this.barWidth,
        -sectionUpHigh,
        code[j]
      )
      this.fillStroke(
        startAt,
        this.h - this.borderWidth,
        this.barWidth,
        sectionUpHigh,
        code[j]
      )
      startAt += this.barWidth
    }
    this.fillStroke(
      startAt,
      this.borderWidth,
      this.barWidth,
      -sectionUpHigh,
      '#808080'
    )
    this.fillStroke(
      startAt,
      this.h - this.borderWidth,
      this.barWidth,
      sectionUpHigh,
      '#808080'
    )
    startAt += this.barWidth
    let sectionUpHigh2 = rico1 * (startAt - 2 * this.barWidth) + b2
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        this.borderWidth,
        this.barWidth,
        -sectionUpHigh2,
        code[j]
      )
      this.fillStroke(
        startAt,
        this.h - this.borderWidth,
        this.barWidth,
        sectionUpHigh2,
        code[j]
      )
      startAt += this.barWidth
    }
    this.fillStroke(
      startAt,
      this.borderWidth,
      this.barWidth,
      -sectionUpHigh2,
      '#808080'
    )
    this.fillStroke(
      startAt,
      this.h - this.borderWidth,
      this.barWidth,
      sectionUpHigh2,
      '#808080'
    )
    startAt += this.barWidth
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        this.borderWidth,
        this.barWidth,
        -sectionUpHigh2,
        code[j]
      )
      this.fillStroke(
        startAt,
        this.h - this.borderWidth,
        this.barWidth,
        sectionUpHigh2,
        code[j]
      )
      startAt += this.barWidth
    }
    this.fillStroke(
      startAt,
      this.borderWidth,
      this.barWidth,
      -sectionUpHigh,
      '#808080'
    )
    this.fillStroke(
      startAt,
      this.h - this.borderWidth,
      this.barWidth,
      sectionUpHigh,
      '#808080'
    )
    startAt += this.barWidth
    for (let j = 0; j < code.length; j++) {
      this.fillStroke(
        startAt,
        this.borderWidth,
        this.barWidth,
        -sectionUpHigh,
        code[j]
      )
      this.fillStroke(
        startAt,
        this.h - this.borderWidth,
        this.barWidth,
        sectionUpHigh,
        code[j]
      )
      startAt += this.barWidth
    }

    this.drawX(this.colors, 0)

    return this.barWidth
  }

  fillStroke(x, y, dx, dy, colorCode) {
    this.ctx.beginPath()
    if (typeof colorCode === 'string') {
      this.ctx.fillStyle = '#808080'
    } else {
      this.ctx.fillStyle = this.barcodeColorValues[colorCode]
    }
    this.ctx.rect(x, y, dx, dy)
    this.ctx.fill()
  }
}
