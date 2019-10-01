<template>
<v-navigation-drawer
      class="deep-purple accent-4"
      dark
      v-model='drawer'
      app
      clipped
      temporary
    >
      <v-list>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click='$auth.logout(); toggleDrawer()'>Logout</v-btn>
        </div>
      </template>
    </v-navigation-drawer>


</template>


<script>
import {mapMutations} from 'vuex'
  export default {
  	name:'Drawer',
    data () {
      return {
        items: [
          { title: 'Dashboard', icon: 'mdi-square' },
          { title: 'Account', icon: 'mdi-account' },
          { title: 'Admin', icon: 'mdi-gavel' },
        ],
      }
    },
    computed:{
    	
    	drawer: {
    		get() {
        return this.$store.state.drawer
      },
      set(val) {
        this.setDrawer(val)
      }
    	}
    },
    methods: {
    	...mapMutations(['setDrawer', 'toggleDrawer']),
    }
  }




</script>


<style>



</style>