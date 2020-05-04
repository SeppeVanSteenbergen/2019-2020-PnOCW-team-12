<template>
  <v-container fluid style="padding-top: 110px">
    <v-row align="center" justify="center" max-width="240px" dense>
      <div>
        <v-card width="240px">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>
              {{
                $store.getters.getRole.room >= 0
                  ? 'Connected to room ' + $store.getters.getRole.room
                  : 'Choose a room'
              }}
            </v-toolbar-title>
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
                    >
                      {{
                        roomList[room_id].open ? 'mdi-lock-open' : 'mdi-lock'
                      }}
                    </v-icon>
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
        <v-btn @click="goFullscreen()">Fullscreen</v-btn>
        <div
          v-show="isFullscreen"
          ref="canvWrap"
          id="canvWrap"
          class="fullscreen"
        >
          <canvas
            ref="canvas"
            id="mainCanvas"
            @click="isFullscreen = false"
            style="position:fixed; left:0; top:0; z-index:10; width:100%; height:100%"
          ></canvas>
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
import Animation from '../algorithms/Animations'
import Sensors from '../algorithms/Sensors'

export default {
  name: 'client',
  data() {
    return {
      canvas: null,
      canvWrap: null,
      intervalObj: null,
      countDownRunning: false,
      defaultCSS:
        'z-index:10; position:fixed; left:0; top:0; width:100%; height:100%; background:#000000',
      videoURL: '',
      canvasMode: true,
      videoTimeout: null,
      delaunayImage: null,
      videoStartTime: null,
      videoSpeedupDelta: 0.05,
      videoSyncThreshold: 16, // how many ms difference from clock before speeding up/slowing down video
      animationRunning: false, // if the animation is currently running
      animationFrame: 0,
      // game variables
      players: {},
      transCSS: null,
      transWidth: null,
      transHeight: null,
      gameInterval: null,
      bulletList: null,
      playerWidth: 40,
      playerHeight: 40,

      isFullscreen: false,
      initialFull: true,

      trackingRunning: false,
      trackingCSS: null,
      trackingDefaultCSS: null,
      trackingImage: null
    }
  },
  mounted() {
    console.log('updateRoomList')
    this.$socket.emit('updateRoomList')

    this.canvWrap = this.$refs.canvWrap

    document.addEventListener('fullscreenchange', this.exitHandler, false)
    document.addEventListener('mozfullscreenchange', this.exitHandler, false)
    document.addEventListener('MSFullscreenChange', this.exitHandler, false)
    document.addEventListener('webkitfullscreenchange', this.exitHandler, false)
  },
  computed: {
    roomList() {
      return this.$store.state.roomList
    },
    fullscreen() {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      )
    }
  },
  sockets: {
    screenCommand(message) {
      if (!this.isFullscreen) {
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
          this.startVideoHandler(message.data)
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
        case 'animation-start':
          this.animationRunning = true
          this.animationStartHandler(message.data)
          break
        case 'animation-stop':
          this.animationRunning = false
          break
        case 'delaunay-image':
          this.setDefaultCSS()
          this.delaunayHandler(message.data)
          break
        case 'load-image':
          this.setDefaultCSS()
          this.loadImageHandler(message.data)
          break
        case 'game-init':
          this.setDefaultCSS()
          this.initGame()
          break
        case 'tracking-init':
          this.resetDefault()
          this.trackingInitHandler(message.data)
          break
        case 'tracking-update':
          this.trackingUpdateHandler(message.data)
          break
        case 'tracking-stop':
          this.trackingStopHandler(message.data)
          break
        default:
          console.log('command not supported')
          break
      }
    },
    updateScreenSize() {
      this.$socket.emit('setScreenSize', {
        size: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      })
    },
    af(data) {
      this.animationFrameHandler(data)
    },
    playerPositions(players) {
      this.players = players
    },
    bulletListUpdate(bulletList) {
      this.bulletList = bulletList
    }
  },
  methods: {
    setDefaultCSS() {
      clearInterval(this.gameInterval)
      clearInterval(this.videoInterval)
      clearInterval(this.intervalObj)
      this.countDownRunning = false
      this.canvWrap.style = this.defaultCSS
      this.canvas.style.transform = new DOMMatrix()
      this.canvasMode = true
      this.animationRunning = false
    },
    resetDefault() {
      clearInterval(this.gameInterval)
      clearInterval(this.videoInterval)
      clearInterval(this.intervalObj)
      this.countDownRunning = false
      this.canvasMode = true
      this.animationRunning = false
    },

    setVideoMode() {
      clearInterval(this.gameInterval)
      this.canvasMode = false
    },
    floodScreenHandler(data) {
      this.runFloodScreenCommandList(data.command, 0)
    },
    displayDetectionScreenHandler(data) {
      const id = this.$store.getters.getRole.client_id
      let factor = 0.06
      const borderWidth =
        window.innerWidth < window.innerHeight
          ? window.innerWidth * factor
          : window.innerHeight * factor

      let drawer = new DetectionDrawer(
        this.canvas,
        { width: window.innerWidth, height: window.innerHeight },
        borderWidth
      )

      drawer.barcode(id, 6)
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
    countDownIntervalHandler(start, interval, startTime) {
      clearInterval(this.intervalObj)
      this.countDownRunning = true
      this.intervalObj = setInterval(
        this.countDownInterval,
        Math.floor(33),
        start,
        interval,
        startTime
      )
      //setTimeout(this.countDownInterval, parseInt(33), start, interval, startTime)
    },
    displayImageCSSHandler(data) {
      this.canvWrap.style = data.css

      let image = new Image()
      let canvas = this.canvas
      let canvWrap = this.canvWrap

      image.onload = function() {
        let ratio = Math.max(data.w / image.width, data.h / image.height)
        let newWidth = Math.round(image.width * ratio)
        let newHeight = Math.round(image.height * ratio)

        canvWrap.style.width = newWidth.toString() + 'px'
        canvWrap.style.height = newHeight.toString() + 'px'
        canvas.width = newWidth
        canvas.height = newHeight
        canvas
          .getContext('2d')
          .drawImage(
            image,
            0,
            0,
            newWidth,
            newHeight
          )
      }
      image.src = data.image
    },
    countDownInterval(start, interval, startTime) {
      if (!this.countDownRunning) return
      let time = this.$store.state.sync.delta + Date.now()
      if (time < startTime) return
      let number = start - Math.floor((time - startTime) / interval)

      if (number > 0) {
        this.drawNumberOnCanvas(number)
      } else {
        this.drawCounterFinish()
        clearInterval(this.intervalObj)
        this.countDownRunning = false
      }
      //setTimeout(this.countDownInterval, parseInt(33), start, interval, startTime)
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
      this.clearCanvas()
      let ctx = this.canvas.getContext('2d')
      ctx.beginPath()
      ctx.strokeStyle = 'rgb(0,0,0)'
      for (let i = 0; i < data.command.length; i++) {
        this.drawArrow(ctx, data.command[i].deg, data.command[i].label)
      }
      ctx.stroke()
    },
    drawArrow(ctx, orientation) {
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
      this.isFullscreen = true

      this.canvas = this.$refs['canvas']

      if (this.initialFull) {
        this.canvas
          .getContext('2d')
          .fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.initialFull = false
      }
    },
    exitRoom() {
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' })
    },
    loadVideoHandler(data) {
      this.videoURL = data.videoURL
      this.canvWrap.style = data.css
      this.canvWrap.height = data.h
      this.canvWrap.width = data.w
      this.canvas.height = data.h
      this.canvas.width = data.w
      this.$refs.vid.load()
      this.$refs.vid.currentTime = 0.1
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
    syncVideo() {
      let time = Date.now() + this.$store.state.sync.delta
      let videoTime = this.videoStartTime + this.$refs.vid.currentTime * 1000
      if (Math.abs(videoTime - time) > 1000) {
        this.$refs.vid.currentTime = Math.round(
          (time - this.videoStartTime) / 1000
        )
      } else if (Math.abs(videoTime - time) < this.videoSyncThreshold) {
        this.$refs.vid.playbackRate = 1
      } else if (videoTime < time) {
        this.$refs.vid.playbackRate = 1 + this.videoSpeedupDelta
      } else {
        this.$refs.vid.playbackRate = 1 - this.videoSpeedupDelta
      }
    },
    startVideoHandler(data) {
      clearInterval(this.videoInterval)
      this.videoInterval = setInterval(this.syncVideo, 30)
      this.videoStartTime = data.startTime
      this.$refs.vid.play()
    },
    pauseVideoHandler() {
      clearInterval(this.videoInterval)
      this.$refs.vid.pause()
    },
    restartVideoHandler() {
      clearInterval(this.videoInterval)
      this.$refs.vid.currentTime = 0
      //this.$refs.vid.load()
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
          imgData.data[i * 4] === 255 &&
          imgData.data[i * 4 + 1] === 255 &&
          imgData.data[i * 4 + 2] === 255
        ) {
          imgData.data[i * 4 + 3] = 0
        }
      }

      return imgData
    },
    animationInitHandler(data) {
      this.startTime = null
      //create animation object
      this.animation = new Animation(
        data.triangulation,
        this.delaunayImage,
        true,
        data.list
      )

      this.animationFrame = 0

      this.delaunayHandler(data)
    },
    animationStartHandler(data) {
      if (!this.animationRunning) return
      let ctx = this.canvas.getContext('2d')
      this.animation.drawSnow(this.canvas)
      let c = document.createElement('canvas')
      let ctx2 = c.getContext('2d')
      c.width = this.delaunayImage.width
      c.height = this.delaunayImage.height
      ctx2.putImageData(this.delaunayImage, 0, 0)
      ctx.drawImage(c, 0, 0)
      if (this.animationFrame > 5) {
        if (this.startTime === null) {
          this.startTime = Date.now() + this.$store.state.sync.delta
        }
        let info = this.animation.getNextFrame(
          this.animationFrame,
          this.startTime,
          Date.now() + this.$store.state.sync.delta
        )
        this.animation.drawAnimal(
          this.canvas,
          info.x - this.minx,
          info.y - this.miny,
          info.angle,
          info.frame,
          info.right,
          true
        )
        this.animationFrame += info.extraFrame
      }

      this.animationFrame++
      requestAnimationFrame(() => this.animationStartHandler(data))
    },
    delaunayHandler(data) {
      //create delaunay image and drawSnow on canvas
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

      this.canvWrap.style = data.css
      this.canvWrap.width = data.w
      this.canvWrap.height = data.h
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
      this.transCSS = data.css
      this.transWidth = data.w
      this.transHeight = data.h
    },
    initGame() {
      this.players = {}
      this.gameInterval = setInterval(this.gameUpdate, 30)
    },
    gameUpdate() {
      this.canvWrap.style = this.transCSS
      let ctx = this.canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.fillStyle = 'blue'
      try {
        for (let i in this.players) {
          // draw life
          ctx.fillStyle = 'red'
          ctx.fillRect(
            this.players[i].pos.x,
            this.players[i].pos.y - 7,
            this.playerWidth,
            5
          )
          ctx.fillStyle = 'green'
          ctx.fillRect(
            this.players[i].pos.x,
            this.players[i].pos.y - 7,
            (this.playerWidth * this.players[i].hp) / 100,
            5
          )

          // draw name
          ctx.fillStyle = 'black'
          ctx.font = '10px Comic Sans MS'
          ctx.textAlign = 'center'
          ctx.fillText(
            this.players[i].name,
            this.players[i].pos.x + this.playerWidth / 2,
            this.players[i].pos.y + this.playerHeight + 15
          )
          // draw points
          ctx.fillText(
            this.players[i].score,
            this.players[i].pos.x + this.playerWidth / 2,
            this.players[i].pos.y + this.playerHeight + 25
          )

          ctx.fillStyle = 'blue'
          // draw player
          ctx.fillRect(
            this.players[i].pos.x,
            this.players[i].pos.y,
            this.playerWidth,
            this.playerHeight
          )

          ctx.beginPath()
          ctx.moveTo(
            this.players[i].pos.x + this.playerWidth / 2,
            this.players[i].pos.y + this.playerHeight / 2
          )
          ctx.lineTo(
            this.players[i].pos.x +
              this.playerWidth / 2 +
              Math.cos(this.players[i].dir) * 60,
            this.players[i].pos.y +
              this.playerHeight / 2 +
              Math.sin(-this.players[i].dir) * 60
          )
          ctx.stroke()
        }
        ctx.fillStyle = 'black'
        for (let i in this.bulletList) {
          ctx.beginPath()
          ctx.arc(
            this.bulletList[i].pos.x + this.playerWidth / 2,
            this.bulletList[i].pos.y + this.playerHeight / 2,
            5,
            0,
            2 * Math.PI
          )
          ctx.fill()
        }
      } catch (e) {
        console.log(e)
      }
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
    },
    trackingInitHandler() {
      this.trackingRunning = true
    },

    trackingUpdateHandler(data) {
      this.canvas.style.transform = new DOMMatrix(data.css)
    },

    trackingStopHandler() {
      this.trackingRunning = false
      this.canvas.style.transform = new DOMMatrix()
    },
  }
}
</script>
<style>
.fullscreen {
  width: 100%;
  height: 100%;
}
</style>
