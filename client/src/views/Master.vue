<template>
  <v-container fluid style="padding-top: 110px">
    <v-row align="center" justify="center" max-width="240px" dense>
      <v-card width="240px">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>
            {{
              $store.getters.getRole.room >= 0
                ? 'Room ' + $store.getters.getRole.room
                : 'Not in Room'
            }}
          </v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-btn
            v-if="typeof myRoom !== 'undefined'"
            small
            :color="myRoom !== null && myRoom.open ? 'success' : 'error'"
            @click="masterPanelToggle"
          >
            <v-icon>
              {{
                myRoom !== null && myRoom.open ? 'mdi-lock-open' : 'mdi-lock'
              }}
            </v-icon>
          </v-btn>
        </v-toolbar>

        <v-expansion-panels
          v-model="masterPanel"
          :readonly="!masterPanelWorking"
          :popout="false"
          :inset="false"
          :focusable="false"
        >
          <v-expansion-panel>
            <v-expansion-panel-header @click="masterPanelToggle"
              >Clients</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <v-list v-if="myRoom !== null">
                <v-list-item
                  v-for="client_id in myRoom.clients"
                  :key="client_id"
                >
                  <v-list-item-icon>
                    <v-icon color="primary">mdi-account</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title
                      class="primary--text"
                      v-text="'Client ' + myRoom.clients.indexOf(client_id)"
                    ></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel v-if="myRoom !== null">
            <v-expansion-panel-header @click="masterPanelToggle"
              >Commands</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <v-btn @click="floodFillDialog = true" text color="primary"
                >Floodfill</v-btn
              >
              <v-btn @click="drawDirectionDialog = true" text color="primary"
                >Draw Direction</v-btn
              >
              <v-btn @click="countdownDialog = true" text color="primary"
                >Countdown</v-btn
              >
              <v-btn
                @click="
                  screenDetectionDialog = true
                  executeDisplayDetectionScreens()
                "
                text
                color="primary"
                >Screen Detection</v-btn
              >
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
    </v-row>
    <v-btn color="error" fab large dark bottom left fixed @click="disconnect()">
      <v-icon class="v-rotate-90">mdi-exit-to-app</v-icon>
    </v-btn>

    <!-- FLOODFILL DIALOG -->
    <v-dialog v-model="floodFillDialog">
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">FLOODFILL</span>
        </v-card-title>
        <v-card-text>
          <v-color-picker
            v-model="color"
            hide-inputs
            hide-mode-switch
            flat
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
                  </v-list-item>
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-switch
            v-model="continousFloodMode"
            label="continuous mode"
          ></v-switch>
          <div class="flex-grow-1"></div>
          <v-btn @click="colorClient()" color="success">Send To All</v-btn>
        </v-card-actions>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn
            @click="
              floodFillDialog = false
              continuousVideoStream = false
            "
            color="error"
            text
            >close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DRAW DIRECTION DIALOG -->
    <v-dialog v-model="drawDirectionDialog">
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">Draw Direction</span>
        </v-card-title>
        <v-card-text>
          <v-slider
            style="padding-top: 50px"
            v-model="angleSlider"
            thumb-label="always"
            :min="0"
            :max="360"
          ></v-slider>

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
                    @click="executeDirections(client_id)"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="'Client ' + myRoom.clients.indexOf(client_id)"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-switch
            v-model="continousDrawDirectionMode"
            label="continuous mode"
          ></v-switch>
          <div class="flex-grow-1"></div>
          <v-btn @click="executeDirections()" color="success"
            >Send To All</v-btn
          >
        </v-card-actions>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn @click="drawDirectionDialog = false" color="error" text
            >close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--COUNTDOWN DIALOG -->
    <v-dialog v-model="countdownDialog">
      <v-card class="pa-4">
        <v-card-title>
          <span class="headline">Countdown</span>
        </v-card-title>
        <v-card-text>
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
          </v-content>
        </v-card-text>
        <br />
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn @click="executeCountdown()" color="success">Send To All</v-btn>
        </v-card-actions>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn @click="countdownDialog = false" color="error" text
            >close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SCREEN DETECTION DIALOG -->
    <v-dialog v-model="screenDetectionDialog" fullscreen>
      <v-stepper v-model="detectionStepper" class="fullheight">
        <template>
          <v-stepper-header>
            <v-stepper-step :complete="detectionStepper > 1" step="1"
              >Take Picture</v-stepper-step
            >

            <v-divider></v-divider>

            <v-stepper-step :complete="detectionStepper > 2" step="2"
              >Result Display</v-stepper-step
            >

            <v-divider></v-divider>

            <v-stepper-step :complete="detectionStepper > 3" step="3"
              >Usage</v-stepper-step
            >
          </v-stepper-header>

          <v-stepper-items class="fullheight overflow-y-auto">
            <v-stepper-content step="1" class="fullheight overflow-y-auto">
              <v-card class="mb-12" elevation="0">
                <div style="height: 25px"></div>
                <v-file-input
                  style="margin: 10px"
                  v-model="displayFileVideo"
                  color="primary"
                  label="Image input"
                  placeholder="Select slave setup image"
                  prepend-icon="mdi-paperclip"
                  outlined
                  accept="image/*"
                  @change="loadFileVideo"
                ></v-file-input>

                <!-- Preview canvas -->
                <canvas ref="canva" class="flex-wrap"></canvas>

                <v-divider :inset="true"></v-divider>
                <div style="height: 15px"></div>

                <v-row dense>
                  <div class="flex-grow-1"></div>
                  <!-- Analyse button -->
                  <v-btn
                    style="margin: 10px"
                    color="primary"
                    @click="
                      nextDetectionStep()
                      resultPanel = [0]
                      analyseImageAsync()
                    "
                    >Analyse image</v-btn
                  >
                </v-row>
                <v-row dense>
                  <div class="flex-grow-1"></div>
                  <!-- Close button -->
                  <v-btn
                    style="margin: 10px"
                    text
                    color="error"
                    @click="screenDetectionDialog = false"
                    >Close</v-btn
                  >
                </v-row>
              </v-card>
            </v-stepper-content>

            <v-stepper-content step="2" class="fullheight overflow-y-auto">
              <v-card class="mb-12 fullheight" elevation="0">
                <div ref="progressBarcontainer">
                  <div></div>
                </div>
                <v-expansion-panels v-model="resultPanel" :multiple="true">
                  <v-expansion-panel>
                    <v-expansion-panel-header>Log</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <div ref="messageBoxContainer">
                        <ul></ul>
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>Result</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <canvas ref="resultCanvas"></canvas>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header
                      >Delaunay</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                      <canvas ref="delaunay2"></canvas>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <div style="height: 15px"></div>
                <v-divider :inset="true"></v-divider>
                <div style="height: 15px"></div>
                <v-row dense>
                  <v-btn
                    style="margin: 10px"
                    :disabled="isBusyAnalysing()"
                    color="primary"
                    @click="
                      executeDisplayDetectionScreens()
                      previousDetectionStep()
                    "
                    >Try Again</v-btn
                  >
                  <div class="flex-grow-1"></div>
                  <v-btn
                    style="margin: 10px"
                    :disabled="isBusyAnalysing()"
                    color="primary"
                    @click="nextDetectionStep()"
                    >Continue</v-btn
                  >
                </v-row>

                <v-row dense>
                  <div class="flex-grow-1"></div>
                  <v-btn
                    style="margin: 10px"
                    color="error"
                    text
                    @click="screenDetectionDialog = false"
                    >Close</v-btn
                  >
                </v-row>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="3" class="fullheight overflow-y-auto">
              <v-card>
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-header>Image</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-file-input
                        v-model="displayFile"
                        color="primary"
                        label="Image input"
                        placeholder="Select image"
                        prepend-icon="mdi-paperclip"
                        outlined
                        :show-size="1000"
                        accept="image/*"
                        @change="loadFile"
                      ></v-file-input>
                      <canvas
                        height="0px"
                        width="0px"
                        ref="drawCanvas"
                      ></canvas>
                      <v-btn
                        color="primary"
                        @click="executeUploadImage"
                        style="margin-top: 10px"
                        >Send Image</v-btn
                      >
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>Video</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-expansion-panels>
                        <v-expansion-panel>
                          <v-expansion-panel-header
                            >Upload</v-expansion-panel-header
                          >
                          <v-expansion-panel-content>
                            <v-file-input
                              v-model="displayFileVideo"
                              color="primary"
                              label="Image input"
                              placeholder="Select video"
                              prepend-icon="mdi-paperclip"
                              outlined
                              accept="video/mp4, video/x-m4v, video/*"
                              @change="loadVideoDisplayFile"
                            ></v-file-input>
                            <canvas
                              ref="videoPreview"
                              height="0px"
                              width="0px"
                            ></canvas>
                            <v-btn color="primary" @click="executeUploadVideo"
                              >UploadVideo</v-btn
                            >
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                        <v-expansion-panel>
                          <v-expansion-panel-header
                            >Link</v-expansion-panel-header
                          >
                          <v-expansion-panel-content>
                            <v-text-field
                              v-model="videoLink"
                              value="url"
                              label="video link"
                              outlined
                            ></v-text-field>
                            <v-btn
                              color="primary"
                              @click="sendVideoURLToClients(videoLink)"
                              >Set Video Link</v-btn
                            >
                          </v-expansion-panel-content>
                        </v-expansion-panel>
                      </v-expansion-panels>
                      <v-divider class="mx-4"></v-divider>
                      <v-spacer></v-spacer>
                      <v-btn
                        style="margin:10px"
                        color="primary"
                        @click="executeVideo"
                        >{{ videoButtonLabel }}</v-btn
                      >
                      <!--<v-btn color="primary" @click="startSync()">Resync</v-btn>-->
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header
                      >Animation</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                      <v-btn color="primary" @click="executeAnimation">{{
                        animationButtonLabel
                      }}</v-btn>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header
                      >Tracking</v-expansion-panel-header
                    >
                    <v-expansion-panel-content>
                      <v-btn color="primary" @click="executeTracking">{{
                        trackingButtonLabel
                      }}</v-btn>
                      <v-switch
                        v-if="isTracking"
                        v-model="rotation"
                        :label="`Track rotation`"
                      ></v-switch>
                      <v-switch
                        v-if="isTracking"
                        v-model="translation"
                        :label="`Track translation`"
                      ></v-switch>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-header>Game</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-btn color="primary" @click="executeInitGame"
                        >Start Game</v-btn
                      >
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>

                <div style="height: 15px"></div>
                <v-divider :inset="true"></v-divider>
                <div style="height: 15px"></div>

                <v-row dense>
                  <v-btn
                    style="margin: 10px"
                    color="primary"
                    @click="
                      detectionStepper = 1
                      executeDisplayDetectionScreens()
                    "
                    >New Slave Setup</v-btn
                  >
                </v-row>
                <v-row dense>
                  <div class="flex-grow-1"></div>
                  <!-- Close button -->
                  <v-btn
                    style="margin: 10px"
                    text
                    color="error"
                    @click="screenDetectionDialog = false"
                    >Close</v-btn
                  >
                </v-row>
              </v-card>
              <v-progress-linear
                :active="fileUploadingActive"
                :value="fileUploadProgress"
                height="20"
                top
                style="z-index: 9999; width: 100vw;position:fixed;left:0px"
              ></v-progress-linear>
            </v-stepper-content>
          </v-stepper-items>
        </template>
      </v-stepper>
    </v-dialog>
  </v-container>
</template>
<script>
import AlgorithmService from '../services/AlgorithmService'
import Animation from '../algorithms/Animations'
import Communicator from '../algorithms/Communicator'
import AnalyseEnv from '../env/AnalyseEnv'
import WaitEnv from '../env/WaitEnv'
import ImageTools from '../algorithms/ImageTools'

import {
  calculateRotation,
  calculateFrameTranslation,
  initializeTracking,
  startTracking,
  stopTracking
} from '../algorithms/Tracking'
import Brief from '../algorithms/Brief'

export default {
  name: 'master',
  data() {
    return {
      color: { r: 200, g: 100, b: 0, a: 1 },
      masterPanel: 0,
      masterPanelWorking: false,

      //floodfill mode
      floodFillDialog: false,
      continousFloodMode: false,
      videoStream: null,

      //draw direction mode
      drawDirectionDialog: false,
      angleSlider: 0,

      //countdown mode
      countdownDialog: false,
      countDownNumber: null,
      countDownInterval: null,
      continousDrawDirectionMode: false,
      continuousVideoStream: false,
      videoSendInterval: null,
      facingUser: true,

      //screen detection mode
      detectionStepper: 1,
      steps: 3,
      resultPanel: [0, 1, 2],
      screenDetectionDialog: false,
      analysedImage: null,
      displayFile: null,
      displayFileVideo: null,
      drawingImg: null,
      drawingImgScale: 1,
      x: 0,
      y: 0,
      Xpos: 0,
      Ypos: 0,
      drawCanvasScale: 1,

      isAnalysing: false,

      videoButtonLabel: 'Start Video',
      videoIsPlaying: false,
      videofile: '',
      animationInterval: null,
      animationFramerate: 50,
      isAnimating: false,
      animationButtonLabel: 'Start Animation',

      fileUploadingActive: false,
      fileUploadProgress: 0,
      videoLink: 'https://stylify.duckdns.org/vid.mp4',

      pictureCanvasInfo: null,

      isTracking: false,
      trackingButtonLabel: 'Start Tracking',
      tracking: null,
      rotation: false,
      translation: false,
      startOrientation: null,
      rotationMatrix: new DOMMatrix(
        'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
      ),
      translationCoord: { x: 0, y: 0 }
    }
  },
  methods: {
    master() {},
    client() {},
    disconnect() {
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' }).catch(error => console.log(error))
    },
    toggleRoom() {
      this.$socket.emit('toggleRoom')
    },
    masterPanelToggle() {
      this.detectionStepper = 1

      if (this.masterPanel === 0) {
        if (this.myRoom.clients.length > 0) {
          this.toggleRoom()
          this.masterPanel = 1
        } else {
          this.$notif('No clients connected', 'error')
        }
      } else {
        this.toggleRoom()
        this.masterPanel = 0
      }
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
      this.$socket.emit('screenCommand', object)
    },
    startVideo() {
      const constraints = {
        audio: false,
        video: {
          facingMode: this.facingUser ? 'user' : 'environment'
        }
      }
      let video = this.$refs.video
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          const track = stream.getVideoTracks()[0]
          const capabilities = track.getCapabilities()
          // Check whether focus distance is supported or not.
          if (capabilities.whiteBalanceMode) {
            track.applyConstraints({
              advanced: [
                { whiteBalanceMode: 'continuous', colorTempurature: 5500 }
              ]
            })
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
          type: 'drawSnow-directions',
          data: {
            command: [
              {
                deg: this.angleSlider
              }
            ]
          }
        },
        to: user_id === null ? 'all' : user_id
      }

      this.$socket.emit('screenCommand', object)
    },
    executeCountdown(user_id = null) {
      this.startSync()
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
    imgDataToBase64(img) {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      let ctx = c.getContext('2d')
      ctx.putImageData(img, 0, 0)
      return c.toDataURL('image/jpeg')
    },
    getBase64Image() {
      const canvas = document.createElement('canvas')
      canvas.width = this.$refs.video.videoWidth
      canvas.height = this.$refs.video.videoHeight
      canvas.getContext('2d').drawImage(this.$refs.video, 0, 0)
      return canvas.toDataURL('image/jpeg')
    },
    switchCamera() {
      this.facingUser = !this.facingUser
      this.startVideo()
    },
    previousDetectionStep() {
      this.detectionStepper -= 1
    },
    nextDetectionStep() {
      this.detectionStepper += 1
    },
    isBusyAnalysing() {
      return this.isAnalysing
    },
    takePicture() {
      this.$refs.canva.width = this.$refs.video.videoWidth
      this.$refs.canva.height = this.$refs.video.videoHeight

      let imgWidth = screen.width - 10
      let ratio = this.$refs.video.videoHeight / this.$refs.video.videoWidth

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
      this.imageFile = file
      let vue = this
      let reader = new FileReader()
      vue.drawingImg = new Image()
      reader.onload = function(event) {
        vue.drawingImg.onload = function() {
          let c = vue.$refs.drawCanvas

          let scale = 1
          let info = null
          if (
            vue.myRoom.clients.length > 0 &&
            vue.analysedImage.screens.length > 0
          ) {
            info = ImageTools.createPictureCanvas(
              vue.drawingImg.width,
              vue.drawingImg.height,
              vue.analysedImage
            )
            scale = info.scale
          }

          let ctx = c.getContext('2d')
          c.width = vue.drawingImg.width * scale
          c.height = vue.drawingImg.height * scale
          ctx.drawImage(vue.drawingImg, 0, 0, c.width, c.height)

          if (info != null) {
            AlgorithmService.drawScreenOutlines(
              c,
              vue.analysedImage,
              info.minx,
              info.miny
            )
          }

          c.style.width = '100%'
        }

        vue.drawingImg.src = reader.result
      }

      if (file) {
        reader.readAsDataURL(file)
      }
    },
    loadVideoDisplayFile(file) {
      this.videoFile = file

      let vue = this
      let reader = new FileReader()
      vue.drawingVideo = document.createElement('video')
      reader.onload = function(event) {
        //when first playable data is available event listener
        vue.drawingVideo.oncanplay = function() {
          let c = vue.$refs.videoPreview

          let scale = 1
          let info = null
          if (
            vue.myRoom.clients.length > 0 &&
            vue.analysedImage.screens.length > 0
          ) {
            info = ImageTools.createPictureCanvas(
              vue.drawingVideo.videoWidth,
              vue.drawingVideo.videoHeight,
              vue.analysedImage
            )
            scale = info.scale
          }

          let ctx = c.getContext('2d')
          c.width = vue.drawingVideo.videoWidth * scale
          c.height = vue.drawingVideo.videoHeight * scale

          ctx.drawImage(vue.drawingVideo, 0, 0, c.width, c.height)

          if (info != null) {
            AlgorithmService.drawScreenOutlines(
              c,
              vue.analysedImage,
              info.minx,
              info.miny
            )
          }

          c.style.width = '100%'
        }

        vue.drawingVideo.src = reader.result

        vue.drawingVideo.load() //Start loading the video data

        vue.drawingVideo.currentTime = 0.1 //Chrome desktop hack, frame at time 0 is blank
      }

      if (file) {
        reader.readAsDataURL(file)
      }
    },
    uploadProgress(evt) {
      this.fileUploadProgress = Math.round((evt.loaded / evt.total) * 100)
    },
    async executeUploadVideo() {
      if (this.analysedImage.screens.length > this.myRoom.clients.length) {
        this.$notif('Detection was not succesful', 'error')
        return
      }
      let formData = new FormData()
      formData.append('videofile', this.videoFile)
      this.$notif('uploading video...', 'info')
      this.fileUploadProgress = 0
      this.fileUploadingActive = true
      this.$axios
        .post('upload/video', formData, {
          headers: {
            'Content-Type': 'multipart/formData'
          },
          onUploadProgress: this.uploadProgress
        })
        .then(result => {
          this.$notif('Video upload successful', 'success')
          this.sendVideoURLToClients(result.data.videoURL)
        })
        .catch(err => {
          this.$notif('Video upload failed, Try Again', 'error')
        })
    },

    sendVideoURLToClients(videoURL) {
      try {
        this.fileUploadingActive = false
        this.fileUploadProgress = 0

        // get all the data
        let info = ImageTools.createPictureCanvas(
          this.analysedImage.width,
          this.analysedImage.height,
          this.analysedImage
        )

        for (let i = 0; i < this.analysedImage.screens.length; i++) {
          let cssMatrix = this.analysedImage.screens[i].cssMatrix

          let user_id = this.myRoom.clients[
            this.analysedImage.screens[i].clientCode
          ]

          let css = this.calcCSS(info, cssMatrix)

          let obj = {
            payload: {
              type: 'load-video',
              data: {
                videoURL: videoURL,
                css: css,
                w: info.w,
                h: info.h,
                ox: info.minx,
                oy: info.miny
              }
            },
            to: user_id
          }

          this.$socket.emit('screenCommand', obj)
        }
        this.startSync()
      } catch (e) {
        this.$notif('Uploading video failed!', 'error')
      }
    },

    async executeUploadImage() {
      if (this.analysedImage.screens.length > this.myRoom.clients.length) {
        this.$notif('Detection was not succesful!', 'error')
        return
      }
      let formData = new FormData()
      formData.append('imagefile', this.imageFile)
      this.$notif('uploading image...', 'info')
      this.fileUploadProgress = 0
      this.fileUploadingActive = true
      this.$axios
        .post('upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/formData'
          },
          onUploadProgress: this.uploadProgress
        })
        .then(result => {
          this.$notif('Image upload successful', 'success')
          this.fileUploadingActive = false
          this.fileUploadProgress = 0
          // get all the data
          let info = ImageTools.createPictureCanvas(
            this.drawingImg.width,
            this.drawingImg.height,
            this.analysedImage
          )

          for (let i = 0; i < this.analysedImage.screens.length; i++) {
            let cssMatrix = this.analysedImage.screens[i].cssMatrix

            let user_id = this.myRoom.clients[
              this.analysedImage.screens[i].clientCode
            ]

            let css = this.calcCSS(info, cssMatrix)

            this.executeDisplayImageCSS(
              user_id,
              result.data.imageURL,
              css,
              info.minx,
              info.miny,
              info.w,
              info.h,
              this.x,
              this.y
            )
          }
        })
        .catch(err => {
          this.$notif('Image upload failed, Try Again', 'error')
        })
    },

    executeAnimation() {
      if (!this.isAnimating) {
        this.isAnimating = true
        this.animationButtonLabel = 'Stop Animation'
        this.executeInitAnimation()
        this.executeStartAnimation()
      } else {
        this.isAnimating = false
        this.animationButtonLabel = 'Start Animation'
        this.executeStopAnimation()
        this.executeDelaunayImage()
      }
    },
    executeStartAnimation() {
      // old animation way
      /*if (this.animationInterval !== null) {
          clearInterval(this.animationInterval)
        }
        this.animationInterval = setInterval(
          this.sendAnimation,
          this.animationFramerate
        )*/

      // new way
      let obj = {
        payload: {
          type: 'animation-start',
          data: {}
        },
        to: 'all'
      }

      this.$socket.emit('screenCommand', obj)
    },

    sendAnimation() {
      let info = this.animation.getNextFrame()

      let obj = [info.x, info.y, info.angle, info.frame, info.right ? 1 : 0]

      this.$socket.emit('af', obj)
    },
    executeStopAnimation() {
      //old way
      /*if (this.animationInterval !== null) {
          clearInterval(this.animationInterval)
        }
        this.animationInterval = null*/

      // new way
      let obj = {
        payload: {
          type: 'animation-stop',
          data: {}
        },
        to: 'all'
      }
      this.$socket.emit('screenCommand', obj)
    },
    executeInitAnimation() {
      this.startSync()
      this.executeDelaunayImage()

      // create animation object
      this.animation = new Animation(
        this.analysedImage.triangulation,
        {
          width: this.analysedImage.width,
          height: this.analysedImage.height
        },
        false
      )
    },

    executeInitGame() {
      let obj = {
        payload: {
          type: 'game-init',
          data: {}
        },
        to: 'all'
      }
      this.$socket.emit('screenCommand', obj)
    },
    executeVideo() {
      if (!this.videoIsPlaying) {
        this.videoIsPlaying = true
        this.videoButtonLabel = 'Stop Video'
        this.executeStartVideo()
      } else {
        this.videoIsPlaying = false
        this.videoButtonLabel = 'Start Video'
        this.executePauseVideo()
        this.executeRestartVideo()
      }
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
          ctx.clearRect(0, 0, c.width, c.height)
          c.width = img.width
          c.height = img.height

          ctx.drawImage(img, 0, 0)

          c.style.width = '100%'
        }

        img.src = reader.result
      }

      if (file) {
        reader.readAsDataURL(file)
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
    calcCSS(info, cssMatrix) {
      let css =
        'z-index: 10; position: fixed; left:' +
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
        'px; object-fit: none; background:#000000'
      return css
    },
    sendCSSImage(img) {
      // get all the data
      let info = ImageTools.createPictureCanvas(
        this.drawingImg.width,
        this.drawingImg.height,
        this.analysedImage
      )

      let base64 = this.imageToBase64(img)

      for (let i = 0; i < this.analysedImage.screens.length; i++) {
        let cssMatrix = this.analysedImage.screens[i].cssMatrix

        let user_id = this.myRoom.clients[
          this.analysedImage.screens[i].clientCode
        ]

        let css = this.calcCSS(info, cssMatrix)

        this.executeDisplayImageCSS(
          user_id,
          base64,
          css,
          info.minx,
          info.miny,
          info.w,
          info.h,
          this.x,
          this.y
        )
      }
    },
    executeDisplayImageCSS(
      user_id,
      base64,
      css,
      minx,
      miny,
      width,
      height,
      offsetX,
      offsetY
    ) {
      let object = {
        payload: {
          type: 'display-image-css',
          data: {
            image: base64,
            ox: minx,
            oy: miny,
            w: width,
            h: height,
            css: css,
            offx: offsetX,
            offy: offsetY
          }
        },
        to: user_id
      }
      this.$socket.compress(true).emit('screenCommand', object)
    },
    async analyseImage() {
      //update roomclientinfo for new connected devices
      this.$socket.emit('updateRoomClientInfo')
      // this.getClientInfo()
      setTimeout(this.getClientInfo, 500)

      this.isAnalysing = true

      let inC = this.$refs.canva
      let outC = this.$refs.resultCanvas

      let progressBarContainer = this.$refs.progressBarcontainer
      let messageBoxContainer = this.$refs.messageBoxContainer

      let inctx = inC.getContext('2d')
      let outctx = outC.getContext('2d')

      let inputImageData = inctx.getImageData(
        0,
        0,
        this.$refs.canva.width,
        this.$refs.canva.height
      )

      this.imgCopy = inputImageData

      let clientInfo = this.$store.state.roomClientInfo

      let communicator = new Communicator(this)
      communicator.sendInfoMessage('Started Image Analysation')

      let analysationEnv = new AnalyseEnv(
        inputImageData,
        clientInfo,
        communicator
      )
      let worker = analysationEnv.getWorker()

      let waitEnv = new WaitEnv(
        worker,
        communicator,
        progressBarContainer,
        messageBoxContainer
      )
      await new Promise(resolve => {
        const CHECKWORKERINTERVAL = 500

        function checkWorker() {
          if (waitEnv.isFinished()) {
            resolve()
          } else {
            setTimeout(checkWorker, CHECKWORKERINTERVAL)
          }
        }

        setTimeout(checkWorker, CHECKWORKERINTERVAL)
      })

      this.analysedImage = waitEnv.getResult()

      this.isAnalysing = false

      outC.width = this.analysedImage.imgOriginalRGB.width
      outC.height = this.analysedImage.imgOriginalRGB.height

      outctx.putImageData(this.analysedImage.imgOriginalRGB, 0, 0)

      AlgorithmService.drawScreenOutlines(outC, this.analysedImage)

      // resize to container width after putting pixel data on canvas
      outC.style.width = '100%'

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

      this.$refs.delaunay2.style.width = '100%'

      this.executeDelaunayImage()
      this.resultPanel = [1]
    },

    executeDelaunayImage() {
      let tri = []
      for (let i = 0; i < this.analysedImage.triangulation.length; i++) {
        tri.push(this.analysedImage.triangulation[i].toObject())
      }

      let midpoints = this.analysedImage.midPoints

      let width = this.analysedImage.width
      let height = this.analysedImage.height

      if (
        this.myRoom.clients.length > 0 &&
        this.analysedImage.screens.length > 0
      ) {
        let info = ImageTools.createPictureCanvas(0, 0, this.analysedImage)

        for (let i = 0; i < this.analysedImage.screens.length; i++) {
          let cssMatrix = this.analysedImage.screens[i].cssMatrix

          let user_id = this.myRoom.clients[
            this.analysedImage.screens[i].clientCode
          ]

          let css = this.calcCSS(info, cssMatrix)

          let obj = {
            payload: {
              type: 'delaunay-image',
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
      }
    },
    executeTracking() {
      if (!this.isTracking) {
        this.isTracking = true
        this.trackingButtonLabel = 'Stop Tracking'
        this.executeStartTracking()
      } else {
        this.isTracking = false
        this.trackingButtonLabel = 'Start Tracking'
        this.executeStopTracking()
      }
    },
    executeInitTracking() {
      let object = {
        payload: {
          type: 'tracking-init',
          data: {}
        },
        to: 'all'
      }
      this.$socket.emit('screenCommand', object)

      return initializeTracking().then(result => {
        this.tracking = result
      })
    },
    handleTracking() {
      if (!this.rotation) {
        this.startOrientation = null
        this.rotationMatrix = new DOMMatrix(
          'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
        )
      }
      if (!this.translation) {
        this.translationCoord = { x: 0, y: 0 }
      }

      let transformation = this.rotationMatrix.translateSelf(
        this.translationCoord.x,
        this.translationCoord.y
      )

      let object = {
        payload: {
          type: 'tracking-update',
          data: {
            css: transformation.toString()
          }
        },
        to: 'all'
      }
      this.$socket.emit('screenCommand', object)
    },
    calculateTranslation(video, context, brief, parameters, previousResults) {
      calculateFrameTranslation(
        video,
        context,
        brief,
        parameters,
        previousResults
      ).then(results => {
        this.translationCoord.x += results.trans.x
        this.translationCoord.y += results.trans.y
        this.handleTracking()

        setTimeout(() => {
          this.calculateTranslation(video, context, brief, parameters, results)
        }, 50)
      })
    },
    executeStartTracking() {
      this.executeInitTracking().then(() => {
        startTracking(this.tracking.sensors, this.tracking.camera)

        this.tracking.sensors.addEventListener('reading', () => {
          let results = calculateRotation(
            this.tracking.sensors,
            this.startOrientation
          )
          this.startOrientation = results.startMatrix
          this.rotationMatrix = results.calculatedRotation

          this.handleTracking()
        })

        let canvas = document.createElement('canvas')
        canvas.width = this.tracking.camera.videoWidth
        canvas.height = this.tracking.camera.videoHeight
        let context = canvas.getContext('2d')
        let brief = new Brief(512)
        let parameters = { threshold: 15, confidence: 0.9 }
        this.calculateTranslation(
          this.tracking.camera,
          context,
          brief,
          parameters,
          {
            trans: this.translationCoord,
            corners: null,
            descriptor: null
          }
        )
      })
    },
    executeStopTracking() {
      let object = {
        payload: {
          type: 'tracking-stop',
          data: {}
        },
        to: 'all'
      }
      this.$socket.emit('screenCommand', object)
      stopTracking(this.tracking.sensors, this.tracking.camera)
      this.executeResetTracking()
    },
    executeResetTracking() {
      this.tracking = null
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
    screenDetectionDialog(n) {
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
