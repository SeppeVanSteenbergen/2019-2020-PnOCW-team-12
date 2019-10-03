<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height='300px'>
      <div>
        <v-card max-width='400px'>
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Choose a room</v-toolbar-title>
            <div class="flex-grow-1"></div>
          </v-toolbar>
          <v-container>
            <v-list v-if='roomList.length !== 0'>
              <v-list>
                <v-list-item v-for="room_id in Object.keys(roomList)" :key="room_id" @click="joinRoom(room_id)">
                  <v-list-item-icon>
                    <v-icon :color="roomList[room_id].open?'success':'error'">{{roomList[room_id].open?'mdi-lock-open':'mdi-lock'}}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="roomList[room_id].name"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-list>
          </v-container>
        </v-card>
        <br />
        <v-btn @click='goFullscreen()'>
          Go Fullscreen
        </v-btn>
        <canvas ref='canvas' class='fullscreen'>
        </canvas>
      </div>
    </v-row>
    <v-btn color="primary" fab large dark bottom left fixed @click="$router.push({name:'home'})">
      <v-icon>mdi-home</v-icon>
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

    document.addEventListener('fullscreenchange', this.exitHandler, false);
    document.addEventListener('mozfullscreenchange', this.exitHandler, false);
    document.addEventListener('MSFullscreenChange', this.exitHandler, false);
    document.addEventListener('webkitfullscreenchange', this.exitHandler, false);
  },
  computed: {
    roomList() {
      return this.$store.state.roomList
    }
  },
  methods: {
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
        
        let ctx = this.canvas.getContext("2d")
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, width / 4, 0, 2 * Math.PI)
        ctx.stroke()

        this.canvas.style.display = 'block'


    },
    openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
    },
    exitHandler() {
        if(!this.fullscreen){
            try{
                this.canvas.style.display = 'none'
            } catch (e) {
                
            }
            
        } else {
            this.fullscreen = false
        }
        
    }
  }
}
</script>
<style>
.fullscreen {
  width: 100%;
  height: 100%;
  display: none
}
</style>