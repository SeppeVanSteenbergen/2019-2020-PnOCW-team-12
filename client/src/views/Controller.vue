<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height="300px">
      <div>
        <v-card max-width="400px">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>{{
              controllerRoom > -1
                ? 'Connected to room ' + controllerRoom
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
                  @click="joinControllerRoom(room_id)"
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
                <v-list-item
                  @click="joinControllerRoom(-1)"
                  v-if="controllerRoom > -1"
                >
                  <v-list-item-icon>
                    <v-icon color="error">mdi-exit-to-app</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Exit Room</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-list>
          </v-container>
        </v-card>
        <br />
        <v-btn @click="openController()">Fullscreen</v-btn>
        <div
          ref="controllerView"
          id="controllerView"
          style="background-color:#97989a"
        ></div>
        <v-btn
          color="error"
          fab
          large
          dark
          bottom
          left
          fixed
          @click="exitRoom()"
        >
          <v-icon>mdi-exit-to-app</v-icon>
        </v-btn>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import nipplejs from 'nipplejs'

export default {
  name: 'Controller',
  data() {
    return {
      controllerRoom: -1,
      options: {
        zone: null,
        maxNumberOfNipples: 2,
        color: 'blue',
        multitouch: true
      },
      manager: null,
      xmov: 0,
      ymov: 0,
      dir: null,
      speed: 2,
      RNipple: false,
      LNipple: false,
      interval: null
    }
  },
  methods: {
    exitRoom() {
      clearInterval(this.interval)
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' })
    },
    joinControllerRoom(room_id) {
      this.controllerRoom = room_id
      this.$socket.emit('connectController', room_id)
    },
    openController() {
      this.openFullscreen(this.$refs.controllerView)
    },
    async openFullscreen(elem) {
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen()
        } else if (elem.mozRequestFullScreen) {
          /* Firefox */
          await elem.mozRequestFullScreen()
        } else if (elem.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          await elem.webkitRequestFullscreen()
        } else if (elem.msRequestFullscreen) {
          /* IE/Edge */
          await elem.msRequestFullscreen()
        }
      } catch (err) {
        console.log(err)
        this.$notif('cannot open fullscreen without user gesture', 'error')
      }
    },
    updateMove() {
      if (this.xmov !== 0 || this.ymov !== 0 || this.dir !== null) {
        if (this.controllerRoom > -1) {
          this.$socket.emit('move', {
            pos: { x: this.xmov, y: this.ymov },
            dir: this.dir,
            room_id: this.controllerRoom
          })
        }
      }
    },
    initNipplejs() {
      this.manager = nipplejs.create(this.options)
      let vue = this
      this.manager
        .on('added', function(evt1, nipple) {
          if (
            nipple.position.x > window.innerWidth / 2 &&
            vue.RNipple === false
          ) {
            vue.RNipple = true
            nipple.on('move', function(evt, data) {
              vue.dir = data.angle.radian
            })
            nipple.on('end', (evt, data) => {
              vue.dir = null
              vue.RNipple = false
            })
          } else if (vue.LNipple === false) {
            vue.LNipple = true
            nipple.on('move', function(evt, data) {
              vue.xmov = Math.cos(data.angle.radian) * vue.speed
              vue.ymov = Math.sin(data.angle.radian) * -vue.speed
            })
            nipple.on('end', (evt, data) => {
              vue.xmov = 0
              vue.ymov = 0
              vue.LNipple = false
            })
          } else {
            nipple.remove()
          }
        })
        .on('removed', function(evt, nipple) {
          nipple.off('start move end dir plain')
        })
      clearInterval(this.interval)
      this.interval = setInterval(this.updateMove, 30)
      console.log('init ready')
    }
  },
  computed: {
    roomList() {
      return this.$store.state.roomList
    }
  },
  mounted() {
    this.options.zone = this.$refs.controllerView
    console.log('updateRoomList')
    this.$socket.emit('updateRoomList')

    this.initNipplejs()
  }
}
</script>

<style scoped></style>
