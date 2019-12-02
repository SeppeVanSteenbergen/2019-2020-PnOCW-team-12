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

            <v-divider></v-divider>

            <v-stepper-step :complete="pictureStepper > 4" step="4" editable>
              Usage
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
                <v-file-input
                  v-model="displayFileVideo"
                  color="deep-purple accent-4"
                  counter
                  label="Image input"
                  placeholder="Select your files"
                  prepend-icon="mdi-paperclip"
                  outlined
                  accept="image/*"
                  @change="loadFileVideo"
                >
                </v-file-input>
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
                    analyseImageAsync()
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
                <canvas ref="delaunay"></canvas>
                <canvas ref="delaunay2"></canvas>
              </v-card>

              <v-btn color="primary" @click="nextStep(3)">
                Continue
              </v-btn>

              <v-btn text @click="pictureModeDialog = false">Cancel</v-btn>
            </v-stepper-content>
            <v-stepper-content step="4" class="fullheight overflow-y-auto">
              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-header>Image</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card class="mb-12 fullheight" elevation="0">
                      <v-file-input
                        v-model="displayFile"
                        color="deep-purple accent-4"
                        counter
                        label="Image input"
                        placeholder="Select your files"
                        prepend-icon="mdi-paperclip"
                        outlined
                        :show-size="1000"
                        accept="image/*"
                        @change="loadFile"
                      >
                      </v-file-input>
                      <!--<v-slider
                        v-model="drawingImgScale"
                        class="align-center"
                        max="2"
                        min="0.05"
                        hide-details
                      ></v-slider>-->
                      <v-btn color="primary" @click="sendCustomImage">
                        Send Image
                      </v-btn>
                      <v-btn color="primary" @click="sendImageCSS">
                        Send Image CSS
                      </v-btn>
                      <canvas ref="drawCanvas"></canvas> </v-card
                  ></v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-header>Video</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card class="mb-12 fullheight" elevation="0">
                      <v-file-input
                        v-model="displayFile"
                        color="deep-purple accent-4"
                        counter
                        label="Image input"
                        placeholder="Select your files"
                        prepend-icon="mdi-paperclip"
                        outlined
                        accept="video/mp4,video/x-m4v,video/*"
                        @change="loadVideoDisplayFile"
                      >
                      </v-file-input>
                      <v-btn color="primary" @click="executeUploadVideo">
                        UploadVideo
                      </v-btn>
                      <v-btn color="primary" @click="executeStartVideo">
                        Start Video
                      </v-btn>
                      <v-btn color="primary" @click="executeRestartVideo">
                        Restart Video
                      </v-btn>
                      <v-btn color="primary" @click="executePauseVideo">
                        Pause Video
                      </v-btn>
                      <canvas ref="drawCanvas"></canvas> </v-card></v-expansion-panel-content>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-header>Animation</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card class="mb-12 fullheight" elevation="0">
                      <v-btn color="primary" @click="executeInitAnimation">
                        Init Animation
                      </v-btn>
                      <v-btn color="primary" @click="executeStartAnimation">
                        Start Animation
                      </v-btn>
                      <v-btn color="primary" @click="executeStopAnimation">
                        Stop Animation
                      </v-btn>
                    </v-card></v-expansion-panel-content
                  >
                </v-expansion-panel>
              </v-expansion-panels>

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
import AlgorithmService from '../services/AlgorithmService'
import Animation from '../algorithms/Animations'

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
      steps: 4,
      pictureModeDialog: false,
      analysedImage: null,
      displayFile: null,
      drawingImg: null,
      drawingImgScale: 1,
      x: 0,
      y: 0,
      Xpos: 0,
      Ypos: 0,
      drawCanvasScale: 1,
      displayFileVideo: null,

      videofile: null,
      animationInterval: null,
      animationFramerate: 30
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
          console.log(stream)

          const track = stream.getVideoTracks()[0]
          console.log(track.getCapabilities())

          const capabilities = track.getCapabilities()
          // Check whether focus distance is supported or not.
          if (capabilities.whiteBalanceMode) {
            console.log(track)
            track.applyConstraints({
              advanced: [
                { whiteBalanceMode: 'continuous', colorTempurature: 5500 }
              ]
            })
            console.log(track)
          }

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
    sendImageToUser(imgData, user_id = null) {
      let base64 = this.imgDataToBase64(imgData)
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
    imgDataToBase64(img) {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      let ctx = c.getContext('2d')
      ctx.putImageData(img, 0, 0)
      return c.toDataURL('image/jpeg')
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

      let imgWidth = screen.width - 10
      let ratio = this.$refs.video.videoHeight / this.$refs.video.videoWidth

      this.$refs.canva.style.width = imgWidth + 'px'
      this.$refs.canva.style.height = Math.round(imgWidth * ratio) + 'px'

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
    async analyseImageAsync() {
      setTimeout(this.analyseImage, 0)
    },
    loadFile(file) {
      let vue = this
      let reader = new FileReader()
      vue.drawingImg = new Image()
      reader.onload = function(event) {
        vue.drawingImg.onload = function() {
          let c = vue.$refs.drawCanvas

          vue.drawCanvasScale =
            window.innerWidth / vue.analysedImage.imgOriginal.width

          let ctx = c.getContext('2d')
          c.width = vue.analysedImage.imgOriginal.width
          c.height = vue.analysedImage.imgOriginal.height

          let imgWidth = screen.width - 10
          let ratio = c.height / c.width

          c.style.width = imgWidth + 'px'
          c.style.height = Math.round(imgWidth * ratio) + 'px'

          console.log('canv', c.width, c.height)

          c.removeEventListener('mousedown', vue.mouseDownHandler, false)
          document.removeEventListener('mouseup', vue.mouseUpHandler, false)
          c.removeEventListener('mousemove', vue.mouseMoveHandler, false)

          vue.mouseDown = false
          vue.Xpos = null
          vue.Ypos = null
          vue.x = 0
          vue.y = 0

          c.addEventListener('mousedown', vue.mouseDownHandler, false)
          c.addEventListener('mouseup', vue.mouseUpHandler, false)
          c.addEventListener('mousemove', vue.mouseMoveHandler, false)

          c.addEventListener('touchstart', vue.mouseDownHandler, false)
          c.addEventListener('touchend', vue.mouseUpHandler, false)
          //el.addEventListener("touchcancel", handleCancel, false)
          //el.addEventListener("touchleave", handleEnd, false)
          c.addEventListener('touchmove', vue.mouseMoveHandler, false)

          ctx.drawImage(
            vue.drawingImg,
            0,
            0,
            vue.drawingImg.width * vue.drawCanvasScale,
            vue.drawingImg.height * vue.drawCanvasScale,
            0,
            0,
            vue.drawingImgScale * vue.drawingImg.width * vue.drawCanvasScale,
            vue.drawingImgScale * vue.drawingImg.height * vue.drawCanvasScale
          )
        }

        vue.drawingImg.src = event.target.result
      }

      reader.readAsDataURL(file)
    },
    loadVideoDisplayFile(file) {
      this.videoFile = file
    },
    async executeUploadVideo() {
      let formData = new FormData()
      formData.append('videofile', this.videoFile)

      this.$axios
        .post('upload/video', formData, {
          headers: {
            'Content-Type': 'multipart/formData'
          }
        })
        .then(result => {
          console.log('upload successful for video: ' + result.data.videoURL)

          // get all the data
          let info = this.analysedImage.createPictureCanvas(
            this.$refs.vid.videoWidth,
              this.$refs.vid.videoHeight,
          )

          for (let i = 0; i < this.analysedImage.screens.length; i++) {
            console.log('looping through screens')
            let cssMatrix = this.analysedImage.screens[i].cssMatrix

            let user_id = this.myRoom.clients[
              this.analysedImage.screens[i].clientCode
            ]

            let css =
              'position: absolute; left:' +
              info.minx +
              'px; top: ' +
              info.miny +
              'px; transform: matrix3d(' +
              cssMatrix.join(', ') +
              '); transform-origin: ' +
              -info.minx +
              'px ' +
              -info.miny +
              'px; width: ' +
              info.w +
              'px; height: ' +
              info.h +
              'px; object-fit: none'

            let obj = {
              payload: {
                type: 'load-video',
                data: {
                  videoURL: result.data.videoURL,
                  css: css,
                  w:info.w,
                  h:info.h,
                  ox: info.minx,
                  oy: info.miny
                }
              },
              to: user_id
            }

            this.$socket.emit('screenCommand', obj)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    executeStartAnimation() {
      if(this.animationInterval !== null) {
        clearInterval(this.animationInterval)
      }
      this.animationInterval = setInterval(this.sendAnimation, this.animationFramerate)
    },

    sendAnimation() {
      let info = this.animation.getNextFrame()

      let obj = [info.x,info.y, info.angle, info.frame, info.right?1:0]

      this.$socket.emit('af', obj)
    },
    executeStopAnimation(){
      if(this.animationInterval !== null) {
        clearInterval(this.animationInterval)
      }
      this.animationInterval = null
    },
    executeInitAnimation() {
      let tri = []
      for (let i = 0; i < this.analysedImage.triangulation.length; i++) {
        tri.push(this.analysedImage.triangulation[i].toObject())
      }

      let midpoints = this.analysedImage.midPoints

      let width = this.analysedImage.width
      let height = this.analysedImage.height

      let info = this.analysedImage.createPictureCanvas(0,0)


      for (let i = 0; i < this.analysedImage.screens.length; i++) {
        console.log('looping through screens')
        let cssMatrix = this.analysedImage.screens[i].cssMatrix

        let user_id = this.myRoom.clients[
            this.analysedImage.screens[i].clientCode
            ]

        let css =
            'position: absolute; left:' +
            info.minx +
            'px; top: ' +
            info.miny +
            'px; transform: matrix3d(' +
            cssMatrix.join(', ') +
            '); transform-origin: ' +
            -info.minx +
            'px ' +
            -info.miny +
            'px; width: ' +
            info.w +
            'px; height: ' +
            info.h +
            'px; object-fit: none'


        let obj = {
          payload: {
            type: 'animation-init',
            data: {
              triangulation: tri,
              midpoints: midpoints,
              width: width,
              height: height,

              css: css,
              ox: info.minx,
              oy: info.miny,
              w: info.w,
              h: info.h
            }
          },
          to: user_id
        }

        this.$socket.emit('screenCommand', obj)
      }

      // create animation object
      this.animation = new Animation(this.analysedImage.triangulation, {
        width: this.analysedImage.width,
        height: this.analysedImage.height
      })
    },
    executeStartVideo() {
      let obj = {
        payload: {
          type: 'start-video',
          data: {}
        },
        to: 'all'
      }

      this.$socket.emit('screenCommand', obj)
    },
    executePauseVideo() {
      let obj = {
        payload: {
          type: 'pause-video',
          data: {}
        },
        to: 'all'
      }

      this.$socket.emit('screenCommand', obj)
    },
    executeRestartVideo() {
      let obj = {
        payload: {
          type: 'restart-video',
          data: {}
        },
        to: 'all'
      }

      this.$socket.emit('screenCommand', obj)
    },
    loadFileVideo(file) {
      let vue = this
      let reader = new FileReader()
      let img = new Image()
      reader.onload = function(event) {
        img.onload = function() {
          let c = vue.$refs.canva
          let ctx = c.getContext('2d')
          c.width = img.width
          c.height = img.height

          ctx.drawImage(img, 0, 0)

          let imgWidth = screen.width - 10
          let ratio = c.height / c.width

          c.style.width = imgWidth + 'px'
          c.style.height = Math.round(imgWidth * ratio) + 'px'
        }

        img.src = event.target.result
      }

      reader.readAsDataURL(file)
    },
    mouseDownHandler(event) {
      let clientX = null
      let clientY = null
      if (typeof event.clientX === 'undefined') {
        clientX = event.targetTouches[0].clientX
        clientY = event.targetTouches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }

      this.mouseDown = true
      this.Xpos = clientX
      this.Ypos = clientY
    },
    mouseUpHandler(event) {
      let clientX = null
      let clientY = null
      if (typeof event.clientX === 'undefined') {
        clientX = event.changedTouches[0].clientX
        clientY = event.changedTouches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }

      this.mouseDown = false
      this.x = this.x + clientX - this.Xpos
      this.y = this.y + clientY - this.Ypos
    },
    mouseMoveHandler(event) {
      let clientX = null
      let clientY = null
      if (typeof event.clientX === 'undefined') {
        clientX = event.targetTouches[0].clientX
        clientY = event.targetTouches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }
      console.log(event.clientX, clientY)
      let c = this.$refs.drawCanvas
      let ctx = c.getContext('2d')
      if (this.mouseDown) {
        ctx.clearRect(0, 0, c.width, c.height)
        ctx.drawImage(
          this.drawingImg,
          (this.x + clientX - this.Xpos) * this.drawCanvasScale,
          (this.y + clientY - this.Ypos) * this.drawCanvasScale,
          this.drawingImg.width * this.drawCanvasScale,
          this.drawingImg.height * this.drawCanvasScale,
          0,
          0,
          this.drawingImgScale * this.drawingImg.width * this.drawCanvasScale,
          this.drawingImgScale * this.drawingImg.height * this.drawCanvasScale
        )
        AlgorithmService.drawScreenOutlines(
          this.$refs.drawCanvas,
          this.analysedImage
        )
      }
    },
    sendCustomImage() {
      // create new image
      let c = document.createElement('canvas')
      c.width = this.$refs.drawCanvas.width
      c.height = this.$refs.drawCanvas.height
      let ctx = c.getContext('2d')

      ctx.drawImage(
        this.drawingImg,
        this.x * this.drawCanvasScale,
        this.y * this.drawCanvasScale,
        this.drawingImg.width * this.drawCanvasScale,
        this.drawingImg.height * this.drawCanvasScale,
        0,
        0,
        this.drawingImgScale * this.drawingImg.width * this.drawCanvasScale,
        this.drawingImgScale * this.drawingImg.height * this.drawCanvasScale
      )
      let img = ctx.getImageData(0, 0, c.width, c.height)

      for (let i = 0; i < this.analysedImage.screens.length; i++) {
        let s = this.analysedImage.screens[i].mapToScreenCV(img)
        let user_id = this.myRoom.clients[
          this.analysedImage.screens[i].clientCode
        ]
        this.sendImageToUser(s, user_id)
      }
    },
    imageToBase64(img) {
      let c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      let ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)

      return c.toDataURL()
    },

    cutOutBase64(img, w, h) {
      let c = document.createElement('canvas')
      c.width = w
      c.height = h
      let ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h)
      return c.toDataURL()
    },
    sendImageCSS() {
      this.sendCSSImage(this.drawingImg)
    },
    sendCSSImage(img) {
      //loaded image to base64 conversion
      console.log('base64 image')

      // get all the data
      let info = this.analysedImage.createPictureCanvas(
        this.drawingImg.width,
        this.drawingImg.height
      )

      let base64 = this.cutOutBase64(img, info.w, info.h)

      console.log(info)

      console.log(this.analysedImage.screens)

      for (let i = 0; i < this.analysedImage.screens.length; i++) {
        console.log('looping through screens')
        let cssMatrix = this.analysedImage.screens[i].cssMatrix

        let user_id = this.myRoom.clients[
          this.analysedImage.screens[i].clientCode
        ]

        let css =
          'position: absolute; left:' +
          info.minx +
          'px; top: ' +
          info.miny +
          'px; transform: matrix3d(' +
          cssMatrix.join(', ') +
          '); transform-origin: ' +
          -info.minx +
          'px ' +
          -info.miny +
          'px; width: ' +
          info.w +
          'px; height: ' +
          info.h +
          'px; object-fit: none'

        this.executeDisplayImageCSS(
          user_id,
          base64,
          css,
          info.minx,
          info.miny,
          info.w,
          info.h
        )
      }
    },
    executeDisplayImageCSS(user_id, base64, css, minx, miny, width, height) {
      let object = {
        payload: {
          type: 'display-image-css',
          data: {
            image: base64,
            ox: minx,
            oy: miny,
            w: width,
            h: height,
            css: css
          }
        },
        to: user_id
      }
      console.log('payload')
      console.log(object)

      this.$socket.compress(true).emit('screenCommand', object)
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

      //let imgCopy = AlgorithmService.copyImageData(inctx, inputImageData)
      let imgCopy = inputImageData

      let clientInfo = this.$store.state.roomClientInfo

      try {
        this.analysedImage = AlgorithmService.fullAnalysis(
          inputImageData,
          clientInfo
        )
      } catch (e) {
        console.log(e)
      }
      console.log(this.analysedImage)

      outC.width = inC.width
      outC.height = inC.height

      let imgWidth = screen.width - 10
      let ratio = inC.height / inC.width

      outC.style.width = imgWidth + 'px'
      outC.style.height = Math.round(imgWidth * ratio) + 'px'

      outctx.putImageData(this.analysedImage.imgOriginal, 0, 0)

      AlgorithmService.drawScreenOutlines(outC, this.analysedImage)

      let midList = []

      for (let i = 0; i < this.analysedImage.screens.length; i++) {
        midList.push(this.analysedImage.screens[i].midPoint)
      }

      let triangulation = AlgorithmService.delaunay(
        midList,
        this.analysedImage.width,
        this.analysedImage.height
      )
      this.analysedImage.triangulation = triangulation
      this.analysedImage.midPoints = midList

      let delaunayImgObject = AlgorithmService.delaunayImage(
        triangulation,
        midList,
        outC.width,
        outC.height
      )
      this.$refs.delaunay2.width = delaunayImgObject.width
      this.$refs.delaunay2.height = delaunayImgObject.height
      this.$refs.delaunay2
        .getContext('2d')
        .putImageData(delaunayImgObject, 0, 0)

      for (let i = 0; i < this.analysedImage.screens.length; i++) {
        let code = this.analysedImage.screens[i].clientCode
        let img = this.analysedImage.screens[i].mapToScreenCV(delaunayImgObject)
        /*let screen = this.analysedImage.screens[i]
          let img = screen.map(
            delaunayImgObject,
            screen.corners,
            screen.width,
            screen.height
          )*/
        this.sendImageToUser(
          img, // image
          this.myRoom.clients[code] // user ID
        )

        if (i === 0) {
          this.$refs.delaunay.width = img.width
          this.$refs.delaunay.height = img.height
          this.$refs.delaunay.getContext('2d').putImageData(img, 0, 0)
        }
      }
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
    },
    drawingImage(n) {
      this.drawingImageLoaded
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
