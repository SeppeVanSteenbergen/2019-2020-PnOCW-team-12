<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid style="padding-top: 110px">
        <v-row align="center" justify="center" dense>
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12" min-height="300px">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Select your login</v-toolbar-title>
                <div class="flex-grow-1"></div>
              </v-toolbar>
              <v-card-text height="100%">
                <v-col align="center" justify="center" height="100%">
                  <div align="center" justify="center" height="100%">
                    <v-btn
                      color="warning"
                      align="center"
                      justify="center"
                      @click="login()"
                    >
                      Login as Guest
                    </v-btn>
                    <br/>
                    <p>
                      By logging in you accept the use of cookies for the identification of the user. No personal information will be stored
                    </p>
                  </div>
                </v-col>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  props: {
    source: String
  },
  data: () => ({
    drawer: null
  }),
  methods: {
    async login() {
      await this.$auth.login()
      if (this.$store.state.userLoggedIn)
        this.$socket.emit('registerUserSocket', {
          user_id: this.$store.state.user.uuid
        })
    }
  }
}
</script>
