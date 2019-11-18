import Image from '../algorithms/Image'
import Delaunay from '../algorithms/Delaunay'

export default {
  fullAnalysis(imgData, clientInfo) {
    let inputImage = new Image(imgData, null, 'RGBA', clientInfo)

    return inputImage
  },

  drawScreenOutlines(c, aImage, scale) {
    let ctx = c.getContext('2d')
    ctx.scale(scale, scale)
    ctx.strokeStyle = '#ff0000'
    let s = aImage.screens
    for (let i = 0; i < s.length; i++) {
      ctx.beginPath()
      ctx.save()
      ctx.moveTo(s[i].corners[0][0], s[i].corners[0][1])
      ctx.lineTo(s[i].corners[1][0], s[i].corners[1][1])
      ctx.lineTo(s[i].corners[2][0], s[i].corners[2][1])
      ctx.lineTo(s[i].corners[3][0], s[i].corners[3][1])
      ctx.lineTo(s[i].corners[0][0], s[i].corners[0][1])
      ctx.closePath()
      ctx.stroke()
    }
    ctx.restore()
  },

  copyImageData(ctx, src) {
    let dst = ctx.createImageData(src.width, src.height)
    dst.data.set(src.data)
    return dst
  },

  delaunay(points) {
    return Delaunay.triangulation(points)
  },

  delaunayImage(triangulation, midPoints, canv) {
    let c = document.createElement('canvas')
    c.width = canv.width
    c.height = canv.height
    let ctx = c.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)

    for (let i = 0; i < triangulation.length; i++) {
      this.drawTriangle(triangulation[i], ctx)
    }
    for (let i = 0; i < midPoints.length; i++) {
      this.drawStar(
        ctx,
        midPoints[i][0],
        midPoints[i][1],
        5,
        c.width / 60,
        (c.width / 60) * 0.6
      )
    }

    return ctx.getImageData(0, 0, c.width, c.height)
  },

  drawTriangle(triangle, ctx) {
    ctx.beginPath()
    ctx.moveTo(triangle.point1[0], triangle.point1[1])
    ctx.lineTo(triangle.point2[0], triangle.point2[1])
    ctx.lineTo(triangle.point3[0], triangle.point3[1])
    ctx.lineTo(triangle.point1[0], triangle.point1[1])
    ctx.closePath()
    ctx.lineWidth = 5
    ctx.strokeStyle = '#000'
    ctx.stroke()
  },
  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    let step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }
    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'blue'
    ctx.stroke()
    ctx.fillStyle = 'skyblue'
    ctx.fill()
  }
}
