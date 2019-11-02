<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height="300px">
      <v-card max-width="400px">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>{{
            $store.getters.getRole.room >= 0
              ? 'Room ' + $store.getters.getRole.room
              : 'Not in Room'
          }}</v-toolbar-title>
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
          <!--<v-tabs-slider></v-tabs-slider>-->
          <v-tab v-for="i in tabs" :key="tabs.indexOf(i)" vertical>
            {{ i.title }}
          </v-tab>

          <v-tab-item>
            <v-btn @click="floodFillDialog = true"> open </v-btn>
          </v-tab-item>

          <v-tab-item>
            <v-container>
              <v-card flat tile>
                <v-card-title>Draw Directions</v-card-title>
                <v-card-text>
                  <v-slider
                    v-model="angleSlider"
                    thumb-label="always"
                    :min="0"
                    :max="360"
                  ></v-slider>
                  <v-switch
                    v-model="continousDrawDirectionMode"
                    label="continuous mode"
                  ></v-switch>
                </v-card-text>

                <v-card-actions>
                  <v-btn @click="executeDirections()">Send To All</v-btn>
                </v-card-actions>
              </v-card>
            </v-container>
          </v-tab-item>

          <v-tab-item>
            <v-content>
              <v-text-field
                label="Starting number"
                outlined
                type="number"
                v-model="countDownNumber"
              ></v-text-field>

              <v-text-field
                label="Interval in ms"
                outlined
                type="number"
                v-model="countDownInterval"
              ></v-text-field>

              <v-btn @click="executeCountdown()">Send To all</v-btn>
            </v-content>
          </v-tab-item>

          <v-tab-item>
            <v-content>
              <v-btn @click="pictureModeDialog = true" class="mx-auto"
                >open dialog</v-btn
              >
            </v-content>
          </v-tab-item>

          <v-tab-item>
            <PictureUpload />
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
          <v-expansion-panels :popout="false" :inset="false" :focusable="false">
            <v-expansion-panel>
              <v-expansion-panel-header
                >Send To Client</v-expansion-panel-header
              >
              <v-expansion-panel-content>
                <v-list v-if="myRoom !== null">
                  <v-list-item
                    v-for="client_id in myRoom.clients"
                    :key="client_id"
                    @click="colorClient(client_id)"
                  >
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
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <br />
        <v-card-actions>
          <v-switch
            v-model="continousFloodMode"
            label="continuous mode"
          ></v-switch>
          <div class="flex-grow-1"></div>
          <v-btn @click="colorClient()" color="success"> Send To All</v-btn>
          <v-btn
            @click="
              floodFillDialog = false
              continuousVideoStream = false
            "
            color="error"
            text
          >
            close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PICTURE MODE DIALOG -->

    <v-dialog v-model="pictureModeDialog" fullscreen>
      <v-stepper v-model="pictureStepper" class="fullheight">
        <template>
          <v-stepper-header>
            <v-stepper-step :complete="pictureStepper > 1" step="1" editable>
              Detection Screen
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="pictureStepper > 2" step="2" editable>
              Take Picture
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="pictureStepper > 3" step="3" editable>
              Result Display
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items class="fullheight overflow-y-auto">
            <v-stepper-content step="1" class="fullheight">
              <v-card class="mb-12 fullheight" elevation="0">
                <v-btn @click="executeDisplayDetectionScreens" color="cyan"
                  >display detection screen</v-btn
                >
              </v-card>

              <v-btn color="primary" @click="nextStep(1)">
                Continue
              </v-btn>

              <v-btn text @click="pictureModeDialog = false">Cancel</v-btn>
            </v-stepper-content>

            <v-stepper-content step="2" class="fullheight overflow-y-auto">
              <v-card class="mb-12" elevation="0">
                <video
                  :autoplay="true"
                  id="videoElement"
                  ref="video"
                  class="flex-wrap"
                ></video>
                <canvas ref="canva" class="flex-wrap"></canvas>
                <br />
                <v-btn @click="startVideo">start video</v-btn>
                <v-btn @click="switchCamera">switch camera</v-btn>
                <v-btn @click="takePicture">Capture Image</v-btn>

                <br />

                <v-btn
                  color="primary"
                  @click="
                    nextStep(2)
                    analyseImage()
                  "
                >
                  Analyse image
                </v-btn>

                <v-btn text @click="pictureModeDialog = false">Cancel</v-btn>
              </v-card>
            </v-stepper-content>

            <v-stepper-content step="3" class="fullheight overflow-y-auto">
              <v-card class="mb-12 fullheight" elevation="0">
                <canvas ref="resultCanvas"></canvas>
              </v-card>

              <v-btn color="primary" @click="nextStep(3)">
                Continue
              </v-btn>

              <v-btn text @click="pictureModeDialog = false">Cancel</v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </template>
      </v-stepper>
      <!--
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">Picture Mode</span>
        </v-card-title>

        <v-card-text>
          <video :autoplay="true" id="videoElement" ref="video"></video>
          <br />
          <v-btn @click="startVideo">start video</v-btn>
          <v-btn @click="switchCamera">switch camera</v-btn>
          <v-btn @click="executeDisplayDetectionScreens"
            >display detection screen</v-btn
          >
          <canvas ref="canv"></canvas>
        </v-card-text>
        <br />
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-switch
            v-model="continuousVideoStream"
            label="Continuous mode"
          ></v-switch>
          <v-btn color="success" @click="executeDisplayImage()">
            Send To All</v-btn
          >
          <v-btn @click="pictureModeDialog = false" color="error" text>
            close</v-btn
          >
        </v-card-actions>
      </v-card>-->
    </v-dialog>
  </v-container>
</template>
<script>
import PictureUpload from '../components/PictureUpload'
import AlgorithmService from '../services/AlgotithmService'

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
          title: 'PictureMode'
        },
        {
          title: 'PictureUpload'
        }
      ],
      color: { r: 200, g: 100, b: 0, a: 1 },
      floodFillDialog: false,
      continousFloodMode: false,
      videoStream: null,
      angleSlider: 0,
      directionLabel: 'Hello',
      countDownNumber: null,
      countDownInterval: null,
      continousDrawDirectionMode: false,
      continuousVideoStream: false,
      videoSendInterval: null,
      facingUser: true,

      // picture mode
      pictureStepper: 0,
      steps: 3,
      pictureModeDialog: false,
      analysedImage: null
    }
  },
  components: {
    PictureUpload
  },
  methods: {
    action() {},
    master() {},
    client() {},
    disconnect() {
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' }).catch(error => console.log(error))
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
        audio: false,
        video: {
          facingMode: this.facingUser ? 'user' : 'environment'
        }
      }
      console.log(constraints)
      let video = this.$refs.video
      console.log(video)
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          video.srcObject = stream
          this.videoStream = stream
        })
        .catch(error => {
          console.log(error.message)
        })
    },
    executeDirections(user_id = null) {
      let object = {
        payload: {
          type: 'draw-directions',
          data: {
            command: [
              {
                deg: this.angleSlider,
                label: this.directionLabel
              }
            ]
          }
        },
        to: user_id === null ? 'all' : user_id
      }

      this.$socket.emit('screenCommand', object)
    },
    executeCountdown(user_id = null) {
      let object = {
        payload: {
          type: 'count-down',
          data: {
            start: this.countDownNumber,
            interval: this.countDownInterval
          }
        },
        to: user_id === null ? 'all' : user_id
      }
      console.log('executing countdown')
      console.log(object)

      this.$socket.emit('screenCommand', object)
    },
    getClientInfo() {
      this.$socket.emit('getClientInfo')
    },
    executeDisplayDetectionScreens() {
      let object = {
        payload: {
          type: 'display-detection-screen',
          data: ''
        },
        to: 'all'
      }

      this.$socket.emit('updateRoomClientInfo')

      setTimeout(this.getClientInfo, 1000)

      this.$socket.emit('screenCommand', object)
    },
    executeDisplayImage(user_id = null) {
      let base64 = this.getBase64Image()
      console.log(base64)
      let object = {
        payload: {
          type: 'display-image',
          data: {
            image: base64 // base64 image
          }
        },
        to: user_id === null ? 'all' : user_id
      }

      this.$socket.emit('screenCommand', object)
    },
    getBase64Image() {
      console.log(this.$refs.video)
      console.log(this.$refs.video.videoWidth)
      const canvas = document.createElement('canvas')
      canvas.width = this.$refs.video.videoWidth
      canvas.height = this.$refs.video.videoHeight
      canvas.getContext('2d').drawImage(this.$refs.video, 0, 0)
      console.log()
      return canvas.toDataURL('image/jpeg')
    },
    switchCamera() {
      this.facingUser = !this.facingUser
      this.startVideo()
    },
    nextStep(n) {
      if (n === this.steps) {
        this.pictureStepper = 1
      } else {
        this.pictureStepper = n + 1
      }
    },
    takePicture() {
      this.$refs.canva.width = this.$refs.video.videoWidth
      this.$refs.canva.height = this.$refs.video.videoHeight
      console.log(this.$refs.canva.width)
      this.$refs.canva
        .getContext('2d')
        .drawImage(
          this.$refs.video,
          0,
          0,
          this.$refs.canva.width,
          this.$refs.canva.height
        )
    },
    analyseImage() {
      console.log('starting analysis')

      let inC = this.$refs.canva
      let outC = this.$refs.resultCanvas
      let inctx = inC.getContext('2d')
      let outctx = outC.getContext('2d')

      let inputImageData = inctx.getImageData(
        0,
        0,
        this.$refs.canva.width,
        this.$refs.canva.height
      )

      let imgCopy = AlgorithmService.copyImageData(inctx, inputImageData)

      let clientInfo = this.$store.state.roomClientInfo

      this.analysedImage = AlgorithmService.fullAnalysis(
        inputImageData,
        clientInfo
      )
      console.log(this.analysedImage)

      outC.width = inC.width
      outC.height = inC.height

      outctx.putImageData(imgCopy, 0, 0)

      AlgorithmService.drawScreenOutlines(outC, this.analysedImage)
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
          this.$store.state.roomList[i] !== null &&
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
    },
    angleSlider() {
      if (this.continousDrawDirectionMode) this.executeDirections()
    },
    continuousVideoStream(n) {
      if (n) {
        this.videoSendInterval = setInterval(
          this.executeDisplayImage,
          1000 / 10
        )
      } else {
        clearInterval(this.videoSendInterval)
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
.fullheight {
  height: 100%;
}
</style>
