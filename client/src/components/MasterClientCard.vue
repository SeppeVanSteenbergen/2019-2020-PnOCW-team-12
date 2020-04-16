<template>
  <v-card max-width="400px">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Select your device role</v-toolbar-title>
      <div class="flex-grow-1"></div>
    </v-toolbar>
    <v-container>
      <div class="flex-column mb-6" justify="center" align="center">
        <v-btn color="warning" @click="$emit('master')"> Master</v-btn>
        <br />
        <br />
        <v-btn color="error" @click="$emit('client')"> Client </v-btn>
        <br />
        <br />
        <v-btn color="green" @click="$emit('controller')">Controller</v-btn>
      </div>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'MasterClientCard',
  data() {
    return {}
  }
}
</script>

<style></style>
