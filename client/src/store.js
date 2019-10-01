import Vue from "vue";
import Vuex from "vuex";
import { set, toggle } from './utils/vuex'
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        socket: {
            connected: false
        },
        drawer: false,
        user: {
            uuid: null
        },
        userLoggedIn: false
    },
    mutations: {
        SOCKET_CONNECT(state) {
            state.socket.connected = true
        },
        SOCKET_DISCONNECT(state) {
            state.socket.connected = false
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
        setUser (state, payload) {
        	state.user = payload
        }
    },
    actions: {

    }
});