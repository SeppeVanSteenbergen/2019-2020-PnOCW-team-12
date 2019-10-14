<template>
  <v-card>
    <v-file-input
      id="inpFile"
      ref="inpFile"
      clearable
      show-size
      counter
      multiple
      prepend-icon="mdi-camera"
      accept="image/*"
      @change="loadFile"
    ></v-file-input>
    <v-btn @click="onUpload"> Upload Picture</v-btn>
    <div class="preview" id="imagePreview">
      <v-img v-if="url" :src="url" class="image-preview"></v-img>
    </div>
    <div v-if="message" :class="`message ${error ? 'is-danger' : 'is-succes'}`">
      <div class="message-body">{{ message }}</div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PictureUpload',
  data() {
    return {
      url: null,
      error: false,
      message: ''
    }
  },
  methods: {
    loadFile: function() {
      const file = inpFile.files[0]
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      const MAX_SIZE = 200000
      const tooLarge = file.size > MAX_SIZE

      if (allowedTypes.includes(file.type)) {
        this.file = file
        this.error = false
        this.message = ''
      } else {
        this.error = true
        this.message = tooLarge
          ? `Too large Max size is ${MAX_SIZE / 1000}Kb`
          : 'only images are allowed'
      }

      this.url = URL.createObjectURL(this.file)
      this.error = false
      this.message = ''
    },
    async onUpload() {
      const fd = new FormData()
      fd.append('file', this.file)

      try {
        await this.$axios.post('/upload', fd)
        this.message = 'File has been uploaded'
        console.log(this.message)
        this.file = ''
        this.url = ''
        this.error = false
      } catch (error) {
        this.message = error.response.data.error
        console.log(this.message)
        this.error = true
      }
    }
  }
}
</script>

<style scoped>
.image-preview {
  width: 150px;
  height: auto;
}
</style>
