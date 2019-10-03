import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import "./registerServiceWorker"
import vuetify from './plugins/vuetify'
import socketio from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'
import './plugins'
import './services/AuthenticationService'
import config from './config/config'
import fullscreen from 'vue-fullscreen'

Vue.config.productionTip = false;

Vue.use(fullscreen)

Vue.use(new VueSocketIO({
    debug: true,
    connection: config.backend.url,
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
}))

new Vue({
  router,
  store,
  vuetify,

  render: function(h) {
    return h(App);
  }
}).$mount("#app");
