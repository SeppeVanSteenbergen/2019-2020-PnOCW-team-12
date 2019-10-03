<template>
  <div>
  <v-app
  v-if='$store.state.userLoggedIn'
  >
    <Drawer/>


    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="headline text-uppercase">
        <span>Image</span>
        <span class="font-weight-light">Connection</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
        <span class='mr-2'>user id:{{user.uuid}} </span>
        <!--<span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>-->
    </v-app-bar>

    <v-content>
      <!--<H1>TEST {{socketMessage}}</H1>-->
      <router-view/>
    </v-content>

    
  </v-app>

  <LoginView v-if='!$store.state.userLoggedIn'/>

</div>
</template>

<script>
import Drawer from './components/Drawer'
import {mapMutations} from 'vuex'
import LoginView from './views/LoginView'

export default {
  name: 'App',
  data() {
    return {
      socketMessage: ''
    }
  },
  components: {
    Drawer, LoginView
  },
  methods: {
    ...mapMutations(['drawerOpen', 'drawerClose']),
    ...mapMutations(['setDrawer', 'toggleDrawer']),
    pingServer() {
      // Send the "pingServer" event to the server.
      this.$socket.emit('pingServer', 'PING!')
    },
    setMessage(mess) {
      this.socketMessage = mess
    }
  },
  sockets: {
        connect: function () {
            if(this.$store.state.userLoggedIn)
              this.$socket.emit('registerUserSocket', this.$store.state.user.uuid)
            console.log('socket connected')
        },
        customEmit: function (data) {
            console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
        },
        data: function(data) {
          console.log(data.message)
          this.socketMessage = data.message
        }
    },
    computed: {
      drawer: {
        get() {
        return this.$store.state.drawer
      },
      set(val) {
        this.setDrawer(val)
      }
      },
      user:{
        get() {
          return this.$store.state.user
        }
      }
    },
    async mounted() {
      await this.$auth.sessionLogin()
      if(this.$store.state.userLoggedIn)
        this.$socket.emit('registerUserSocket', this.$store.state.user.uuid)
    }
};
</script>
