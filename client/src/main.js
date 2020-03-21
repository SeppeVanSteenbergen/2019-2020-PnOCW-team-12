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

new Vue({
  router,
  store,
  vuetify,

  render: function(h) {
    return h(App)
  }
}).$mount('#app')
