<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height="300px">
      <div>
        <v-card max-width="400px">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Choose a room</v-toolbar-title>
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
        <canvas ref="canvas" class="fullscreen"> </canvas>
      </div>
    </v-row>
    <v-btn color="error" fab large dark bottom left fixed @click="exitRoom()">
      <v-icon>mdi-exit-to-app</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
export default {
  name: 'client',
  data() {
    return {
      fullscreen: false,
      canvas: null
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
          this.floodScreenHandler(message.data)
          break
        case 'count-down':
          this.countDownHandler(message.data)
          break
        case 'draw-directions':
          this.drawDirectionsHandler(message.data)
          break
        default:
          console.log('command not supported')
          break
      }
    }
  },
  methods: {
    floodScreenHandler(data) {
      console.log('given command:')
      console.log(data.command)
      this.runFloodScreenCommandList(data.command, 0)
    },
    runFloodScreenCommandList(list, startIndex) {
      for (let i = startIndex; i < list.length; i++) {
        if (list[i].type === 'color') {
          this.colorCanvas(list[i].value)
        } else if (list[i].type === 'interval') {
          setTimeout(
            this.runFloodScreenCommandList(list, i + 1),
            parseInt(list[i].value)
          )
        }
      }
    },
    countDownHandler(data) {},
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
      this.openFullscreen(this.canvas)
      const width = window.screen.width
      const height = window.screen.height

      this.canvas.height = height
      this.canvas.width = width

      let ctx = this.canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, width / 4, 0, 2 * Math.PI)
      ctx.stroke()

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
    }
  }
}
</script>
<style>
.fullscreen {
  width: 100%;
  height: 100%;
  display: none;
}
</style>
