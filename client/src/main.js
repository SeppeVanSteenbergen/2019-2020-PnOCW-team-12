import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import SocketIO from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'
import './plugins'
import './services/AuthenticationService'
import config from './config/config'
import fullscreen from 'vue-fullscreen'

Vue.config.productionTip = false

const options = {
  secure: config.secure
}

Vue.use(fullscreen)

Vue.use(
  new VueSocketIO({
    debug: true,
    /*connection: SocketIO(config.secure
        ? config.backend.url.replace('http', 'https')
        : config.backend.url, options),*/
    connection: config.backend.url,
    options,
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
    }
  })
)

Vue.prototype.startSync = function() {
  this.$store.state.sync.active = true
  this.$store.dispatch('showSnackbar', {
    text: 'Starting synchronisation',
    color: 'info'
  })
  this.$socket.emit('startSync', '')
}

Vue.prototype.printToConsole = function(message, color, time) {
  this.$store.dispatch('showSnackbar', {
    text: message,
    color: color,
    time: time
  })
}

Vue.prototype.printToConsole = function(message, color) {
  this.$store.dispatch('showSnackbar', {
    text: message,
    color: color
  })
}

new Vue({
  router,
  store,
  vuetify,

  render: function(h) {
    return h(App)
  }
}).$mount('#app')

import Algebra from './algorithms/Algebra'
import Animations from './algorithms/Animations'
import ColorRange from './algorithms/ColorRange'
import ColorSpace from './algorithms/ColorSpace'
import Communicator from './algorithms/Communicator'
import CornerDetector from './algorithms/CornerDetector'
import Delaunay from './algorithms/Delaunay'
import DetectionDrawer from './algorithms/DetectionDrawer'
import Drawer from './algorithms/Drawer'
import Image from './algorithms/Image'
import Island from './algorithms/Island'
import Line from './algorithms/Line'
import PermutationConverter from './algorithms/PermutationConverter'
import PixelIterator from './algorithms/PixelIterator'
import Point from './algorithms/Point'
import Reconstructor from './algorithms/Reconstructor'
import RGBBarcodeScanner from './algorithms/RGBBarcodeScanner'
import Screen from './algorithms/Screen'
import Triangle from './algorithms/Triangle'


window.Algebra = Algebra
window.Animations = Animations
window.ColorRange = ColorRange
window.ColorSpace = ColorSpace
window.Communicator = Communicator
window.CornerDetector = CornerDetector
window.Delaunay = Delaunay
window.DetectionDrawer = DetectionDrawer
window.Drawer = Drawer
window.ImageAlg = Image
window.Island = Island
window.Line = Line
window.PermutationConverter = PermutationConverter
window.PixelIterator = PixelIterator
window.Point = Point
window.Reconstructor = Reconstructor
window.RGBBarcodeScanner = RGBBarcodeScanner
window.Screen = Screen
window.Triangle = Triangle
// Adding all algorithm classes to window
