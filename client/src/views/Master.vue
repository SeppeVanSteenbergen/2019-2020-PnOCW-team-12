<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" min-height='300px'>
            <v-card max-width='400px'>
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Room</v-toolbar-title>
                    <div class="flex-grow-1"></div>
                </v-toolbar>
                <v-container>
                    <v-list>
                        <v-list>
                            <v-list-item v-for="item in items" :key="item.title" @click="">
                                <v-list-item-icon>
                                    <v-icon v-if="item.icon" color="pink">mdi-star</v-icon>
                                </v-list-item-icon>
                                <v-list-item-content>
                                    <v-list-item-title v-text="item.title"></v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-avatar>
                                    <v-img :src="item.avatar"></v-img>
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-list>
                    </v-list>
                </v-container>
            </v-card>
        </v-row>
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

        }
    }
};
</script>