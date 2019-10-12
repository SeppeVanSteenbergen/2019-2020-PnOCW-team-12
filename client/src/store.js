import Vue from 'vue'
import Vuex from 'vuex'
import { set, toggle } from './utils/vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: {
      connected: false,
      state: {}
    },
    drawer: false,
    user: {
      uuid: null
    },
    userLoggedIn: false,
    roomList: {}
  },
  mutations: {
    SOCKET_CONNECT(state) {
      state.socket.connected = true
    },
    SOCKET_DISCONNECT(state) {
      state.socket.connected = false
      state.socket.state = {}
    },
    SOCKET_SOCKETSTATE(state, socketState) {
      state.socket.state = socketState
    },
    SOCKET_roomListUpdate(state, roomList) {
      console.log('room list updated')
      console.log(roomList)
      state.roomList = roomList
    },
    drawerOpen(state) {
      state.drawer = true
    },
    drawerClose(state) {
      state.drawer = false
    },
    setDrawer: set('drawer'),
    toggleDrawer: toggle('drawer'),
    setLoggedIn(state, payload) {
      state.userLoggedIn = payload
    },
    setUser(state, payload) {
      state.user = payload
    }
  },
  actions: {},
  getters: {
    getRole(state) {
      if (state.roomList !== {}) {
        console.log('calculating with')

        for (let i = 0; i < Object.keys(state.roomList).length; i++) {
          if (state.roomList[i].master === state.user.uuid) {
            return {
              role: 1,
              room: i
            }
          }
          console.log(state.roomList[i].clients.length)

          for (let j = 0; j < Object.keys(state.roomList[i].clients).length; j++) {
            console.log('COMPARING')
            console.log(state.roomList[i].clients[j])
            console.log(state.user.uuid)
            if (state.roomList[i].clients[j] === state.user.uuid) {
              return {
                role: 0,
                room: i
              }
            }
          }
        }
      }

      return {
        role: -1,
        room: -1
      }
    }
  }
})
