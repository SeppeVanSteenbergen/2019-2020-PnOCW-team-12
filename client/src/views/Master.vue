<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height="300px">
      <v-card max-width="400px">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Room</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-btn
            v-if="typeof myRoom !== 'undefined'"
            small
            :color="myRoom !== null && myRoom.open ? 'success' : 'error'"
            @click="toggleRoom()"
          >
            <v-icon>
              {{
                myRoom !== null && myRoom.open ? 'mdi-lock-open' : 'mdi-lock'
              }}
            </v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-list v-if="myRoom !== null">
            <v-list-item v-for="client_id in myRoom.clients" :key="client_id">
              <v-list-item-icon>
                <v-icon v-if="false" color="pink">mdi-star</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title
                  v-text="'Client ' + myRoom.clients.indexOf(client_id)"
                ></v-list-item-title>
              </v-list-item-content>
              <!--<v-list-item-avatar>
                                    <v-img :src="item.avatar"></v-img>
                                </v-list-item-avatar>-->
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
      <v-card
        class=""
        v-if="myRoom !== null && !myRoom.open"
        style="width:40vw;height:50vh; min-width:400px"
      >
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Commands</v-toolbar-title>
          <div class="flex-grow-1"></div>
        </v-toolbar>
        <v-tabs
          v-model="tab"
          background-color="blue accent-4"
          class="elevation-2"
          dark
          centered
          vertical
          style="height:100%"
          touchless
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab v-for="i in tabs" :key="tabs.indexOf(i)" vertical>
            {{ i.title }}
          </v-tab>

          <v-tab-item>
            <v-btn @click="floodFillDialog = true"> open </v-btn>
          </v-tab-item>
          <v-tab-item>
            <v-card flat tile>
              <v-card-text>Draw Directions</v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            Some text
          </v-tab-item>
          <v-tab-item>
            <v-content>
              webcam
              <v-btn @click="pictureModeDialog = true" class="mx-auto"
                >open dialog</v-btn
              >
            </v-content>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-row>
    <v-btn color="error" fab large dark bottom left fixed @click="disconnect()">
      <v-icon class="v-rotate-90">mdi-exit-to-app</v-icon>
    </v-btn>
    <v-dialog v-model="floodFillDialog">
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">Apply Colors</span>
        </v-card-title>
        <v-card-text>
          <v-color-picker
            v-model="color"
            hide-mode-switch
            class="mx-auto"
            style="width:100%;"
          ></v-color-picker>
        </v-card-text>
        <br />
        <v-card-actions>
          <v-switch
            v-model="continousFloodMode"
            label="continuous mode"
          ></v-switch>
          <div class="flex-grow-1"></div>
          <v-btn @click="colorClient()" color="success"> Send To All</v-btn>
          <v-btn @click="floodFillDialog = false" color="error" text>
            close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="pictureModeDialog" fullscreen>
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">Picture Mode</span>
        </v-card-title>
        <v-card-text>
          <video autoplay="true" id="videoElement" ref="video"></video>
          <br />
          <v-btn @click="startVideo">start video</v-btn>
        </v-card-text>
        <br />
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="success"> Send To All</v-btn>
          <v-btn @click="pictureModeDialog = false" color="error" text>
            close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'master',
  data() {
    return {
      tab: null,
      tabs: [
        {
          title: 'floodfill'
        },
        {
          title: 'draw direction'
        },
        {
          title: 'countdown'
        },
        {
          title: 'PicutreMode'
        }
      ],
      color: { r: 200, g: 100, b: 0, a: 1 },
      floodFillDialog: false,
      continousFloodMode: false,
      pictureModeDialog: false,
      videoStream: null
    }
  },
  methods: {
    action() {},
    master() {},
    client() {},
    disconnect() {
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' })
    },
    toggleRoom() {
      this.$socket.emit('toggleRoom')
    },
    colorClient(user_id = null) {
      let object = {
        payload: {
          type: 'flood-screen',
          data: {
            command: [
              {
                type: 'color',
                value: [this.color.r, this.color.g, this.color.b]
              }
            ]
          }
        },
        to: user_id === null ? 'all' : user_id
      }

      console.log(object)
      this.$socket.emit('screenCommand', object)
    },
    startVideo() {
      const constraints = {
        video: true
      }
      const video = this.$refs.video

      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        video.srcObject = stream
        this.videoStream = stream
      })
    }
  },
  mounted() {
    this.$socket.emit('updateRoomList')
  },
  computed: {
    myRoom() {
      for (let i in this.$store.state.roomList) {
        if (
          typeof this.$store.state.roomList[i] !== 'undefined' &&
          this.$store.state.roomList[i].master === this.$store.state.user.uuid
        ) {
          return this.$store.state.roomList[i]
        }
      }
      return null
    },
    roomList() {
      return this.$store.state.roomList
    }
  },
  watch: {
    color() {
      if (this.continousFloodMode) {
        this.colorClient()
      }
    },
    pictureModeDialog(n) {
      console.log('exit picture ' + n)
      if (!n && this.videoStream !== null) {
        this.videoStream.getTracks().forEach(track => {
          track.stop()
        })
      }
    }
  }
}
</script>

<style>
#videoElement {
  width: 90%;
  max-width: 400px;
  height: auto;
  background-color: #666;
}
</style>
