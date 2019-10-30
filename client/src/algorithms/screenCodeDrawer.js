export default class ScreenCodeDrawer {
  constructor(canvas, screen, borderWidth) {
    this.w = screen.width
    this.h = screen.height
    this.borderWidth = borderWidth
    this.c1 = '#0000ff'
    this.c2 = '#00ff00'
    this.canvas = canvas
    this.barcodeColorValues = ['#f60', '#cf0', '#0ff', '#c0f', '#f06']
  }

  drawBorder() {
    this.canvas.width = this.w
    this.canvas.height = this.h
    let ctx = this.canvas.getContext('2d')
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
  }

  clearBarcode() {
    const ctx = this.canvas.getContext('2d')
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

    this.clearBarcode()

    const ctx = this.canvas.getContext('2d')
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

/*const borderWidth = screen.width * 0.02
const c = document.getElementById('canv')

let drawer = new DetectionDrawer(c, screen, borderWidth)
drawer.drawBorder()*/
