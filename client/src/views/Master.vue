<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center" min-height='300px'>
      <v-card max-width='400px'>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Room</v-toolbar-title>
          <div class="flex-grow-1"></div>
          <v-btn v-if="typeof myRoom !== 'undefined'" small :color="(myRoom !== null &&myRoom.open)?'success':'error'" @click='toggleRoom()'>
            <v-icon>
              {{myRoom !== null && myRoom.open?'mdi-lock-open':'mdi-lock'}}
            </v-icon>
          </v-btn>
        </v-toolbar>
        <v-container>
          <v-list v-if="myRoom !== null">
            <v-list-item v-for="client_id in myRoom.clients" :key="client_id" @click="">
              <v-list-item-icon>
                <v-icon v-if='false' color="pink">mdi-star</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="'Client ' + myRoom.clients.indexOf(client_id)"></v-list-item-title>
              </v-list-item-content>
              <!--<v-list-item-avatar>
                                    <v-img :src="item.avatar"></v-img>
                                </v-list-item-avatar>-->
            </v-list-item>
          </v-list>
        </v-container>
      </v-card>
      <v-card class="" v-if='myRoom !== null && !myRoom.open'>
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Commands</v-toolbar-title>
          <div class="flex-grow-1"></div>
        </v-toolbar>
          <v-tabs v-model="tab" background-color="blue accent-4" class="elevation-2" dark :centered="centered" :grow="grow" :vertical="true" >
            <v-tabs-slider></v-tabs-slider>
            <v-tab v-for="i in tabs" :key="tabs.indexOf(i)" :href="`#tab-${tabs.indexOf(i)}`">
              {{i.title}}
            </v-tab>
            <v-tab-item v-for="i in tabs" :key="i" :value="i.title">
              <v-card flat tile>
                <v-card-text>{{ text }}</v-card-text>
              </v-card>
            </v-tab-item>

            <v-tab-item v-for="i in tabs" :key="i" :value="'tab-' + tabs.indexOf(i)">
              <v-card flat tile>
                <v-card-text>{{ text }}</v-card-text>
              </v-card>
            </v-tab-item>

            <v-tab-item :key="tabs.indexOf('floodfill')" :value="'tab-' + tabs.indexOf('floodfill')">
              <v-color-picker
      v-model="color"
      :hide-canvas="hideCanvas"
      :hide-inputs="hideInputs"
      :hide-mode-switch="hideModeSwitch"
      :mode.sync="mode"
      :show-swatches="showSwatches"
      class="mx-auto"
    ></v-color-picker>
            </v-tab-item>


          </v-tabs>
      </v-card>
    </v-row>
    <v-btn color="error" fab large dark bottom left fixed @click="disconnect()">
      <v-icon class='v-rotate-90'>mdi-exit-to-app</v-icon>
    </v-btn>
  </v-container>
</template>
<script>
import axios from '../plugins/axios'
import MasterClientCard from '../components/MasterClientCard'
export default {
  name: "master",
  components: {
    MasterClientCard
  },
  data() {
    return {
      tab: null,
      tabs: [{
        title: 'floodfill'
      },{
        title: 'draw direction'
      }, {
        title: 'countdown'
      }]
    }
  },
  methods: {
    action() {

    },
    master() {

    },
    client() {

    },
    disconnect() {
      this.$socket.emit('exitRoom')
      this.$router.push({ name: 'home' })
    },
    toggleRoom() {
      this.$socket.emit('toggleRoom')
    }
  },
  mounted() {
    this.$socket.emit('updateRoomList')
  },
  computed: {
    myRoom() {
      for (let i in this.$store.state.roomList) {
        if (typeof this.$store.state.roomList[i] !== 'undefined' && this.$store.state.roomList[i].master === this.$store.state.user.uuid) {
          return this.$store.state.roomList[i]
        }
      }
      return null
    },
    roomList() {
      this.$store.state.roomList
    }
  },
};
</script>