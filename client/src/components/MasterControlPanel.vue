<template>
  <v-card max-width="400px">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Select your device role</v-toolbar-title>
      <div class="flex-grow-1"></div>
    </v-toolbar>
    <v-container>
      <div class="flex-column mb-6" justify="center" align="center">
        <v-btn color="warning" @click="master()"> Master</v-btn>
        <br />
        <br />
        <v-btn color="error" @click="client()"> Client </v-btn>
      </div>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'MasterControlPanel',
  data() {
    return {}
  },
  methods: {
    master() {
      console.log('master clicked')
      this.$emit('master')
    },
    client() {
      this.$emit('client')
    }
  }
}
</script>

<style></style>
