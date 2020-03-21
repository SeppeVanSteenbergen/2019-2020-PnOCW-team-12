<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height="300px">
      <div>
        <v-card max-width="400px">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>{{
              $store.getters.getRole.room >= 0
                ? 'Connected to room ' + $store.getters.getRole.room
                : 'Choose a room'
            }}</v-toolbar-title>
            <div class="flex-grow-1"></div>
          </v-toolbar>
          <v-container>
            <v-list v-if="roomList.length !== 0">
              <v-list>
                <v-list-item
                  v-for="room_id in Object.keys(roomList)"
                  :key="room_id"
                  @click="joinRoom(room_id)"
                >
                  <v-list-item-icon>
                    <v-icon
                      :color="roomList[room_id].open ? 'success' : 'error'"
                      >{{
                        roomList[room_id].open ? 'mdi-lock-open' : 'mdi-lock'
                      }}</v-icon
                    >
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title
                      v-text="roomList[room_id].name"
                    ></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-list>
          </v-container>
        </v-card>
        <br />
        <v-btn @click="goFullscreen()">
          Go Fullscreen
        </v-btn>
        <div ref="canvWrap" class="fullscreen">
          <canvas ref="canvas"> </canvas>
          <video ref="vid">
            <source :src="videoURL" />
          </video>
        </div>
      </div>
    </v-row>
    <v-btn color="error" fab large dark bottom left fixed @click="exitRoom()">
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import DetectionDrawer from '../algorithms/DetectionDrawer'
import AlgorithmService from '../services/AlgorithmService'
import NumberConverter from '../algorithms/PermutationConverter'
import Animation from '../algorithms/Animations'
import Image from '../algorithms/Image'

export default {
  name: 'client',
  data() {
    return {
      fullscreen: false,
      canvas: null,
      intervalObj: null,
      defaultCSS: 'width:100%;height:100%',
      videoURL: '',
      canvasMode: true,
      videoTimeout: null,
      delaunayImage: null
    }
  },
  mounted() {
    console.log('updateRoomList')
    this.$socket.emit('updateRoomList')

    document.addEventListener('fullscreenchange', this.exitHandler, false)
    document.addEventListener('mozfullscreenchange', this.exitHandler, false)
    document.addEventListener('MSFullscreenChange', this.exitHandler, false)
    document.addEventListener('webkitfullscreenchange', this.exitHandler, false)
  },
  computed: {
    roomList() {
      return this.$store.state.roomList
    }
  },
  sockets: {
    screenCommand(message) {
      if (!this.fullscreen) {
        this.goFullscreen()
      }
      switch (message.type) {
        case 'flood-screen':
          this.setDefaultCSS()
          this.floodScreenHandler(message.data)
          break
        case 'count-down':
          this.setDefaultCSS()
          this.countDownHandler(message.data)
          break
        case 'drawSnow-directions':
          this.setDefaultCSS()
          this.drawDirectionsHandler(message.data)
          break
        case 'display-image':
          this.setDefaultCSS()
          this.drawImageHandler(message.data)
          break
        case 'display-detection-screen':
          this.setDefaultCSS()
          this.displayDetectionScreenHandler(message.data)
          break
        case 'display-image-css':
          this.setDefaultCSS()
          this.displayImageCSSHandler(message.data)
          break
        case 'load-video':
          this.setVideoMode()
          this.loadVideoHandler(message.data)
          break
        case 'start-video':
          this.startVideoHandler()
          break
        case 'pause-video':
          this.pauseVideoHandler()
          break
        case 'restart-video':
          this.restartVideoHandler()
          break
        case 'animation-init':
          this.setDefaultCSS()
          this.animationInitHandler(message.data)
          break
        case 'delaunay-image':
          this.setDefaultCSS()
          this.delaunayHandler(message.data)
          break
        case 'load-image':
          this.setDefaultCSS()
          this.loadImageHandler(message.data)
        default:
          console.log('command not supported')
          break
      }
    },
    updateScreenSize() {
      this.$socket.emit('setScreenSize', {
        size: {
          width: screen.width,
          height: screen.height
        }
      })
    },
    pings(data) {
      if (typeof data !== 'undefined') {
        data.clientTime = window.Date.now()
        console.log(data)
        this.$socket.emit('pongs', data)
      }
    },
    af(data) {
      this.animationFrameHandler(data)
    }
  },
  methods: {
    setDefaultCSS() {
      this.canvas.style = this.defaultCSS
      this.canvasMode = true
    },
    setVideoMode() {
      this.canvasMode = false
    },
    floodScreenHandler(data) {
      console.log('given command:')
      console.log(data.command)
      this.runFloodScreenCommandList(data.command, 0)
    },
    displayDetectionScreenHandler(data) {
      const id = this.$store.getters.getRole.client_id
      let factor = 0.06
      const borderWidth =
        screen.width < screen.height
          ? screen.width * factor
          : screen.height * factor

      let drawer = new DetectionDrawer(this.canvas, screen, borderWidth)

      //drawer.drawBorder()

      drawer.barcode(id + 2, 7)
    },
    runFloodScreenCommandList(list, startIndex) {
      for (let i = startIndex; i < list.length; i++) {
        if (list[i].type === 'color') {
          this.colorCanvas(list[i].value)
        } else if (list[i].type === 'interval') {
          setTimeout(
            this.runFloodScreenCommandList,
            parseInt(list[i].value),
            list,
            i + 1
          )
        }
      }
    },
    countDownHandler(data) {
      this.countDownIntervalHandler(data.start, data.interval, data.startTime)
    },
    countdownRecursive(number, interval) {
      console.log(
        'countdown recursive num: ' + number + ' interval: ' + interval
      )
      if (number === 0) {
        this.drawCounterFinish()
      } else {
        this.drawNumberOnCanvas(number)
        setTimeout(
          this.countdownRecursive,
          parseInt(interval),
          number - 1,
          interval
        )
      }
    },
    countDownIntervalHandler(start, interval, startTime) {
      clearInterval(this.intervalObj)
      this.intervalObj = setInterval(
        this.countDownInterval,
        Math.floor(interval / 2),
        start,
        interval,
        startTime
      )
    },
    /**
     *
     * @param data
     *        image: base64
     *        css: css of canvas
     *        ox:
     *        oy:
     *        w:
     *        h:
     */
    displayImageCSSHandler(data) {
      this.canvas.width = data.w
      this.canvas.height = data.h
      this.canvas.style = data.css

      let image = new window.Image()

      let vue = this

      image.onload = function() {
        let ratio = Math.max(data.w / image.width, data.h / image.height)
        vue.canvas
          .getContext('2d')
          .drawImage(
            image,
            0,
            0,
            Math.round(image.width * ratio),
            Math.round(image.height * ratio)
          )
      }
      image.src = data.image
    },
    countDownInterval(start, interval, startTime) {
      let time = this.$store.state.sync.delta + Date.now()
      console.log('server time: ' + time)
      if (time < startTime) return
      let number = start - Math.floor((time - startTime) / interval)

      if (number > 0) {
        this.drawNumberOnCanvas(number)
      } else {
        this.drawCounterFinish()
        clearInterval(this.intervalObj)
      }
    },
    drawNumberOnCanvas(num) {
      this.clearCanvas()
      let ctx = this.canvas.getContext('2d')

      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      let baseCanvasWidth = 1000
      let fontSize = 200

      let currentFontSize = (this.canvas.width * fontSize) / baseCanvasWidth

      ctx.font = currentFontSize + 'px sans-serif'

      ctx.fillText(num, this.canvas.width / 2, this.canvas.height / 2)
    },
    drawCounterFinish() {
      /*let img = new Image()

        img.onload = function() {
          let c = document.createElement('canvas')
          c.width = img.width
          c.height = img.height
          let ctx = c.getContext('2d')

          ctx.drawImage(img, 0, 0)

          let base64 = c.toDataURL('image/jpeg')

          this.drawImageHandler({ image: base64 })
        }

        img.src = 'https://penocw12.student.cs.kuleuven.be/img/martijn.jpg'*/
      this.drawNumberOnCanvas('BOOM!')
    },
    drawDirectionsHandler(data) {
      console.log('clearing console')
      this.clearCanvas()
      let ctx = this.canvas.getContext('2d')
      ctx.beginPath()
      ctx.strokeStyle = 'rgb(0,0,0)'
      for (let i = 0; i < data.command.length; i++) {
        this.drawArrow(ctx, data.command[i].deg, data.command[i].label)
      }
      ctx.stroke()
    },
    drawArrow(ctx, orientation, label) {
      let headLen = 10
      const radians = (orientation * Math.PI) / 180
      const arrowLength =
        this.canvas.width > this.canvas.height
          ? this.canvas.height * 0.4
          : this.canvas.width * 0.4
      let dx = Math.sin(radians) * arrowLength
      let dy = Math.cos(radians) * arrowLength
      let midX = this.canvas.width / 2
      let midY = this.canvas.height / 2
      let arrowEndX = this.canvas.width / 2 + dx
      let arrowEndY = this.canvas.height / 2 - dy

      ctx.moveTo(midX, midY)

      ctx.lineTo(arrowEndX, arrowEndY)
      ctx.lineTo(
        arrowEndX + headLen * Math.cos(-radians - Math.PI / 2 - Math.PI / 6),
        arrowEndY - headLen * Math.sin(-radians - Math.PI / 2 - Math.PI / 6)
      )
      ctx.lineTo(arrowEndX, arrowEndY)
      ctx.lineTo(
        arrowEndX + headLen * Math.cos(-radians - Math.PI / 2 + Math.PI / 6),
        arrowEndY - headLen * Math.sin(-radians - Math.PI / 2 + Math.PI / 6)
      )
    },
    colorCanvas(rgb) {
      //this.clearCanvas()
      let ctx = this.canvas.getContext('2d')
      ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    },
    clearCanvas() {
      let ctx = this.canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      //ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      //ctx.fill()
    },
    joinRoom(room_id) {
      this.$socket.emit('joinRoom', room_id)
      this.$router.push({ params: { room_id: room_id } })
    },
    goFullscreen() {
      this.fullscreen = true
      //this.$refs['full'].toggle()
      //this.fullscreen = !this.fullscreen

      this.canvas = this.$refs['canvas']
      this.openFullscreen(this.$refs.canvWrap)
      const width = window.screen.width
      const height = window.screen.height

      this.canvas.height = height
      this.canvas.width = width
      /*
        let ctx = this.canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, width / 4, 0, 2 * Math.PI)
        ctx.stroke()*/

      this.canvas.style.display = 'block'
    },
    openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen()
      }
    },
    exitHandler() {
      if (!this.fullscreen) {
        this.canvas.style.display = 'none'
      } else {
        this.fullscreen = false
      }
    },
    exitRoom() {
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' })
    },
    drawImageHandler(data) {
      const base64Image = data.image
      console.log('got image as base64')
      console.log(base64Image)
      const canvas = this.canvas
      let ctx = this.canvas.getContext('2d')
      let image = new window.Image()

      image.onload = function() {
        let wRatio = canvas.width / image.width
        let hRatio = canvas.height / image.height

        let ratio = Math.min(wRatio, hRatio)

        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          canvas.width / 2 - (image.width * ratio) / 2,
          canvas.height / 2 - (image.height * ratio) / 2,
          image.width * ratio,
          image.height * ratio
        )
      }
      image.src = base64Image
    },
    stopRunning() {
      clearInterval(this.intervalObj)
    },
    loadVideoHandler(data) {
      this.videoURL = data.videoURL
      this.canvas.style = data.css
      this.canvas.height = data.h
      this.canvas.width = data.w
      this.$refs.vid.load()
      this.$refs.vid.style = 'display:none'
      this.beginVideoTimeout()
    },
    beginVideoTimeout() {
      let c = this.canvas
      let ctx = c.getContext('2d')

      this.videoLoop(ctx)
    },
    videoLoop(ctx) {
      if (!this.canvasMode) {
        let ratio = Math.max(
          this.canvas.width / this.$refs.vid.videoWidth,
          this.canvas.height / this.$refs.vid.videoHeight
        )
        ctx.drawImage(
          this.$refs.vid,
          0,
          0,
          Math.round(this.$refs.vid.videoWidth * ratio),
          Math.round(this.$refs.vid.videoHeight * ratio)
        )
        setTimeout(this.videoLoop, 1000 / 30, ctx) // drawing at 30fps
      }
    },
    startVideoHandler() {
      this.$refs.vid.play()
    },
    pauseVideoHandler() {
      this.$refs.vid.pause()
    },
    restartVideoHandler() {
      this.$refs.vid.load()
    },

    cutout(imgData, w, h, minx, miny) {
      let c = document.createElement('canvas')
      c.width = imgData.width
      c.height = imgData.height
      let ctx = c.getContext('2d')

      ctx.putImageData(imgData, 0, 0)
      return ctx.getImageData(minx, miny, w, h)
    },
    cutoutTrans(imgData, w, h, minx, miny) {
      let c = document.createElement('canvas')
      c.width = imgData.width
      c.height = imgData.height
      let ctx = c.getContext('2d')

      ctx.putImageData(imgData, 0, 0)
      imgData = ctx.getImageData(minx, miny, w, h)

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
    animationInitHandler(data) {
      //create animation object
      this.animation = new Animation(null, this.delaunayImage, true)

      this.delaunayHandler(data)
    },
    delaunayHandler(data) {
      //create delaunay image and drawSnow on canvas
      console.log('received triangulation')
      console.log(data.triangulation)
      this.delaunayImage = AlgorithmService.delaunayImageTransparent(
        data.triangulation,
        data.midpoints,
        data.width,
        data.height
      )

      // cut right part out of delaunay image
      this.delaunayImage = this.cutoutTrans(
        this.delaunayImage,
        data.w,
        data.h,
        data.ox,
        data.oy
      )
      //this.delaunayImage = Image.resizeImageData(this.delaunayImage, [data.w, data.h])

      //display the image on the screen
      let c = document.createElement('canvas')
      //c.width = data.w
      //c.height = data.h
      // add style to the output canvas

      let ctx = this.canvas.getContext('2d')

      this.canvas.style = data.css
      this.canvas.width = data.w
      this.canvas.height = data.h
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      let c2 = document.createElement('canvas')
      let ctx2 = c2.getContext('2d')

      c2.width = this.delaunayImage.width
      c2.height = this.delaunayImage.height

      ctx2.putImageData(this.delaunayImage, 0, 0)
      ctx.drawImage(c2, 0, 0)

      //ctx.putImageData(this.delaunayImage, 0,0)

      this.minx = data.ox
      this.miny = data.oy
    },
    /**
     *
     * @param data
     *        [x,y,angle,frame, right]
     */
    animationFrameHandler(data) {
      let ctx = this.canvas.getContext('2d')
      this.animation.drawSnow(this.canvas)
      let c = document.createElement('canvas')
      let ctx2 = c.getContext('2d')
      c.width = this.delaunayImage.width
      c.height = this.delaunayImage.height
      ctx2.putImageData(this.delaunayImage, 0, 0)
      ctx.drawImage(c, 0, 0)
      this.animation.drawAnimals(
        5,
        150,
        this.canvas,
        data[0] - this.minx,
        data[1] - this.miny,
        data[2],
        data[3],
        data[4]
      )
    }
  }
}
</script>
<style>
.fullscreen {
  width: 100%;
  height: 100%;
}
</style>
