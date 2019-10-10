<template>
  <v-card>
    <v-file-input
      label="File input"
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
    <v-btn>Upload Picture</v-btn>
    <div class="preview" id="imagePreview">
      <v-img v-if="url" :src="url" contain class="image-preview"></v-img>
    </div>
  </v-card>
</template>

<script>
  export default {
    name: 'PictureUpload',
    data() {
      return {
        url: null,
      }
    },
    methods: {
      loadFile: function(e)  {
        const file = inpFile.files[0];
        this.url = URL.createObjectURL(file);
      }
    }
  };
</script>

<style scoped>

</style>
