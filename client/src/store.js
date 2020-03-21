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
    roomList: {},
    roomClientInfo: [],
    snackbar: {
      active: false,
      text: '',
      color: 'blue',
      time: 2500
    },
    sync: {
      delta: 0,
      active: false
    }
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
    SOCKET_roomClientInfo(state, roomClientInfo) {
      state.roomClientInfo = roomClientInfo
    },
    syncInfo(state, info) {
      state.sync.delta = info.delta
    },
    SOCKET_syncReady(state) {
      state.sync.active = false
    },
    drawerOpen(state) {
      state.drawer = true
    },
    drawerClose(state) {
      state.drawer = false
    },
    setDrawer: set('drawer'),
    toggleDrawer: toggle('drawer'),
    setSnackbarActive(state, value) {
      state.snackbar.active = value
    },
    setLoggedIn(state, payload) {
      state.userLoggedIn = payload
    },
    setUser(state, payload) {
      state.user = payload
    },
    setSnackbar(state, payload) {
      console.log(payload)
      state.snackbar.text = payload.text ? payload.text : ''
      state.snackbar.color = payload.color ? payload.color : 'blue'
      state.snackbar.time = payload.time ? payload.time : 3000
      state.snackbar.active = true
    }
  },
  actions: {
    /**
     *
     * @param state
     * @param payload
     *        {
     *          text: '',
     *          time: '',
     *          color: ''
     *        }
     */
    showSnackbar({ commit }, payload) {
      commit('setSnackbar', payload)
    },
    setSyncInfo({ commit }, payload) {
      commit('syncInfo', payload)
      commit('setSnackbar', {
        text:
          'successfully synced browser with ' +
          Math.round(payload.delta) +
          'ms offset',
        color: 'success',
        time: 4000
      })
    }
  },
  getters: {
    getRole(state) {
      if (state.roomList !== {}) {
        console.log('calculating with')

        for (let i in state.roomList) {
          console.log('STORE MASTER')
          console.log(i)
          console.log(state.roomList[i])
          console.log(state.roomList)
          if (state.roomList[i].master === state.user.uuid) {
            return {
              role: 1,
              room: i
            }
          }
          console.log(state.roomList[i].clients.length)

          for (
            let j = 0;
            j < Object.keys(state.roomList[i].clients).length;
            j++
          ) {
            console.log('COMPARING')
            console.log(state.roomList[i].clients[j])
            console.log(state.user.uuid)
            if (state.roomList[i].clients[j] === state.user.uuid) {
              return {
                role: 0,
                room: i,
                client_id: j
              }
            }
          }
        }
      }

      return {
        role: -1,
        room: -1,
        client_id: -1
      }
    },
    getSnackbarInfo(state) {
      return state.snackbar
    },
    getTimeDelta(state) {
      return state.sync.delta
    },
    serverTime(state) {
      return Date.now() + state.sync.delta
    }
  }
})
