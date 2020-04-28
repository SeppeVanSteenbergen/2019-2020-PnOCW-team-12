<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height="300px" dense>
      <MasterClientCard v-on:master="master" v-on:client="client" v-on:controller="controller" />
    </v-row>
  </v-container>
</template>
<script>
import axios from '../plugins/axios'
import MasterClientCard from '../components/MasterClientCard'
export default {
  name: 'home',
  components: {
    MasterClientCard
  },
  data() {
    return {
      something: ''
    }
  },
  methods: {
    async action() {
      /*console.log('sending request')
      let result = await axios
        .get('/login/guest')
        .then(function(data) {
          this.something = data.data
        })
        .catch(err => {
          console.log(err)
        })*/
    },
    showSnack() {
      this.$store.dispatch('showSnackbar', {
        text: 'hello there',
        color: 'red',
        time: 10000
      })
    },
    master() {
      console.log('master')
      this.$socket.emit('createRoom')
      try {
        this.$router.push({ name: 'master' })
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
