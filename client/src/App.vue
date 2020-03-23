<template>
  <div>
    <v-app v-if="$store.state.userLoggedIn">
      <Drawer />

      <v-app-bar app clipped-left>
        <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="headline text-uppercase">
          <span>Screen</span>
          <span class="font-weight-light">Caster</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn
          icon
          color="grey"
          v-if="getRole().role === 1"
          @click="startSync()"
        >
          <v-icon>mdi-cached</v-icon>
        </v-btn>
        <v-icon>{{
          getRole().role === 1
            ? 'mdi-account-tie'
            : getRole().role === 0
            ? 'mdi-account'
            : 'mdi-account-alert'
        }}</v-icon>
        <span
          class="mr-2 font-weight-bold headline text-uppercase"
          id="sroleDisplay"
          >{{
            getRole().role === 1
              ? 'Master'
              : getRole().role === 0
              ? 'Client ' + getRole().client_id
              : ''
          }}</span
        >
        <!--<span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>-->
      </v-app-bar>

      <v-content>
        <!--<H1>TEST {{socketMessage}}</H1>-->
        <router-view />
      </v-content>
      <v-snackbar
        v-model="snackbar"
        :bottom="true"
        :color="$store.state.snackbar.color"
        :timeout="getSnackbarInfo.time"
      >
        {{ getSnackbarInfo.text }}
      </v-snackbar>
    </v-app>

    <LoginView v-if="!$store.state.userLoggedIn" />
    <!-- -->
  </div>
</template>

<script>
import Drawer from './components/Drawer'
import { mapMutations, mapGetters } from 'vuex'
import LoginView from './views/LoginView'

export default {
  name: 'App',
  data() {
    return {
      socketMessage: '',
      loggingIn: true
    }
  },
  components: {
    Drawer,
    LoginView
  },
  methods: {
    ...mapMutations(['drawerOpen', 'drawerClose']),
    ...mapMutations(['setDrawer', 'toggleDrawer', 'setSnackbarActive']),
    ...mapGetters(['getRole']),
    pingServer() {
      // Send the "pingServer" event to the server.
      this.$socket.emit('pingServer', 'PING!')
    },
    setMessage(mess) {
      this.socketMessage = mess
    }
  },
  sockets: {
    connect: async function() {
      if (this.$store.state.userLoggedIn && !this.loggingIn) {
        /*let resp = await this.$auth.getSocketRegistrationKey()
        if (resp.success) {
          this.$socket.emit('registerUserSocket', {
            user_id: this.$store.state.user.uuid,
            key: resp.data.key
          })*/

        this.$socket.emit('registerUserSocket', {
          user_id: this.$store.state.user.uuid
        })
      } else {
        // display error message
      }

      console.log('socket connected')
    },
    customEmit: function(data) {
      console.log(
        'this method was fired by the socket server. eg: io.emit("customEmit", data)'
      )
    },
    data: function(data) {
      console.log(data.message)
      this.socketMessage = data.message
    },
    disconnect: function() {
      try {
        //this.$router.push('/')
      } catch (e) {
        console.log(e)
      }
    },
    pings: function(TS1) {
      const TC1 = Date.now()
      const D = TC1 - TS1

      const TC2 = Date.now()
      //console.log('got ping message')
      this.$socket.emit('pongs', {
        TC2: TC2,
        TC1: TC1,
        TS1: TS1,
        D: D
      })
    },
    syncInfo: function(data) {
      this.$store.dispatch('setSyncInfo', data)
    }
  },
  computed: {
    ...mapGetters(['getSnackbarInfo']),
    drawer: {
      get() {
        return this.$store.state.drawer
      },
      set(val) {
        this.setDrawer(val)
      }
    },
    user: {
      get() {
        return this.$store.state.user
      }
    },
    snackbar: {
      get() {
        return this.$store.state.snackbar.active
      },
      set(val) {
        this.setSnackbarActive(val)
      }
    }
  },
  async mounted() {
    this.$vuetify.theme.dark = true
    this.loggingIn = true
    await this.$auth.sessionLogin()
    if (this.$store.state.userLoggedIn)
      this.$socket.emit('registerUserSocket', {
        user_id: this.$store.state.user.uuid
      })

    try {
      if (this.getRole().role === 1) {
        this.$router.push('/master')
      } else if (this.getRole().role === 0) {
        this.$router.push('/client')
      } else {
        this.$router.push('/')
      }
    } catch (e) {
      console.log(e)
    }
    this.loggingIn = false
  }
}
</script>

<style>
#roleDisplay {
  font-size: 40pt;
}
</style>
