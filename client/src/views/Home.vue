<template>
  <v-container fluid style="padding-top: 110px">
    <v-row align="center" justify="center" max-width="240px" dense>
      <v-card width="240px">
        <v-toolbar color="primary" dark flat>
          <div class="flex-grow-1"></div>
          <v-toolbar-title>Select your device role</v-toolbar-title>
          <div class="flex-grow-1"></div>
        </v-toolbar>
        <v-container>
          <div justify="center" align="center">
            <v-btn
              color="warning"
              @click="master()"
              style="margin-top: 13px; margin-bottom: 25px;"
              >Master</v-btn
            >
            <br />
            <v-btn color="error" @click="client()" style="margin-bottom: 25px;"
              >Client</v-btn
            >
            <br />
            <v-btn
              color="green"
              @click="controller()"
              style="margin-bottom: 13px;"
              >Controller</v-btn
            >
          </div>
        </v-container>
      </v-card>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'home',
  methods: {
    master() {
      try {
        this.$router.push({ name: 'master' })
        this.$socket.emit('createRoom')
      } catch (e) {
        console.log(e)
      }
    },
    client() {
      try {
        this.$router.push({ name: 'client' })
      } catch (e) {
        console.log(e)
      }
    },
    controller() {
      try {
        this.$router.push({
          name: 'controller'
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
