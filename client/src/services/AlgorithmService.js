import Image from '../algorithms/Image'
import Delaunay from '../algorithms/Delaunay'
import Communicator from '../algorithms/Communicator'

export default {
  fullAnalysis(imgData, clientInfo, masterVue) {
    // DEPRECATED, MOVED TO workerEnv AND waitEnv

    // imgData = Image.resizeImageData(imgData, [1920, 1080])
    // let communicator = new Communicator(masterVue)
    // let inputImage = new Image(imgData, null, 'RGBA', clientInfo, communicator)

    // return inputImage

    // let result = null;
    // let analysed = false

    // let analyseWorker = new Worker("worker.js")

    // let comm = new Communicator(masterVue)
    // comm.sendSuccessMessage("Started Analyse on a worker!")

    // analyseWorker.onmessage = function(m) {
    //   if(m.data.text === "DONE"){
    //     console.log(m.data.result)
    //     result = m.data.result
    //     analysed = true
    //     analyseWorker.terminate()
    //   }
    // }

    // let sizedImgData = Image.resizeImageData(imgData, [1920, 1080])

    // analyseWorker.postMessage({
    //   text: "START",
    //   param: [sizedImgData, clientInfo]
    // })

    //busy wait om te testen nog
    // while(!analysed){}

    // return result;
  },

  drawScreenOutlines(c, aImage) {
    let ctx = c.getContext('2d')
    ctx.strokeStyle = '#ff0000'
    let s = aImage.screens
    for (let i = 0; i < s.length; i++) {
      ctx.beginPath()
      ctx.moveTo(s[i].corners[0][0], s[i].corners[0][1])
      ctx.lineTo(s[i].corners[1][0], s[i].corners[1][1])
      ctx.lineTo(s[i].corners[2][0], s[i].corners[2][1])
      ctx.lineTo(s[i].corners[3][0], s[i].corners[3][1])
      ctx.lineTo(s[i].corners[0][0], s[i].corners[0][1])
      ctx.closePath()
      ctx.stroke()
    }
  },

  copyImageData(ctx, src) {
    let dst = ctx.createImageData(src.width, src.height)
    dst.data.set(src.data)
    return dst
  },

  delaunay(points, width, height) {
    return Delaunay.triangulation(points, width, height)
  },

  delaunayImage(triangulation, midPoints, width, height) {
    let c = document.createElement('canvas')
    c.width = width
    c.height = height
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
  delaunayImageTransparent(triangulation, midPoints, width, height) {
    let c = document.createElement('canvas')
    c.width = width
    c.height = height
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

    let imgData = ctx.getImageData(0, 0, c.width, c.height)

    for (let i = 0; i < c.width * c.height; i++) {
      if (
        imgData.data[i * 4 + 0] === 255 &&
        imgData.data[i * 4 + 1] === 255 &&
        imgData.data[i * 4 + 2] === 255
      ) {
        imgData.data[i * 4 + 3] = 0
      }
    }

    return imgData
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
