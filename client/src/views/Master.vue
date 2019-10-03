<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" min-height='300px'>
            <v-card max-width='400px'>
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Room</v-toolbar-title>
                    <div class="flex-grow-1"></div>
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
        </v-row>
        <v-btn
        color="error"
        fab
        large
        dark
        bottom
        left
        fixed
        @click="disconnect()"
      >
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
            items: [
          { icon: true, title: 'Client 0'},
          { title: 'Client 1'},
          { title: 'Client 2'},
          { title: 'Client 3'},
        ]
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
            this.$router.push({name:'home'})
        }
    },
    mounted() {
        this.$socket.emit('updateRoomList')
    },
    computed:{
        myRoom() {
            for(let i = 0; i < Object.keys(this.$store.state.roomList).length; i++) {
                if(typeof this.$store.state.roomList[i]!== 'undefined' && this.$store.state.roomList[i].master === this.$store.state.user.uuid) {
                    return this.$store.state.roomList[i]
                }
            }
            return null
        }
    }
};
</script>