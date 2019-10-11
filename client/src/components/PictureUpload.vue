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
    <v-btn @click= "onUpload"> Upload Picture</v-btn>
    <div class="preview" id="imagePreview">
      <v-img v-if="url" :src="url" contain class="image-preview"></v-img>
    </div>
  </v-card>
</template>

<script>
  import axios from 'axios'
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
        console.log(this.url);
      },
      onUpload() {
        const fd = new FormData();
        fd.append('image',this.file,this.file.name)
        axios.post(
      }
    }
  };
</script>

<style scoped>

</style>
