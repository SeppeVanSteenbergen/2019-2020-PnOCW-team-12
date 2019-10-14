<template>
  <v-navigation-drawer
    class="deep-purple accent-4"
    src="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
    dark
    v-model="drawer"
    app
    clipped
    temporary
  >
    <v-list-item>
      <v-list-item-avatar>
        <v-img
          src="../../public/img/icons/screencast_icon_512_blue.png"
        ></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="title">
          SCREENCASTER
        </v-list-item-title>
        <v-list-item-subtitle>
          P&O Groep 12
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        @click="$router.push(item.link)"
        link
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-switch v-model="darkMode" label="Dark Mode"></v-switch>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <p style="color: #4e6686">user id:{{ user.uuid }}</p>
      <br/>
        <br/>
        <v-btn
          block
          @click="
            $auth.logout()
            toggleDrawer()
          "
          >Logout</v-btn
        >
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
  name: 'Drawer',
  data() {
    return {
      items: [
        { title: 'Home', icon: 'mdi-home', link: '/' },
        /*{ title: 'Master', icon: 'mdi-account-tie', link: 'master' },
        { title: 'Client', icon: 'mdi-account', link: 'client' }*/
      ],
      darkMode: false
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
    user: {
      get() {
        return this.$store.state.user
      }
    }
  },
  methods: {
    ...mapMutations(['setDrawer', 'toggleDrawer', 'setDarkMode'])
  },
  watch: {
    darkMode(n) {
      this.$vuetify.theme.dark = n
      this.setDrawer(false)
    }
  }
}
</script>

<style></style>
