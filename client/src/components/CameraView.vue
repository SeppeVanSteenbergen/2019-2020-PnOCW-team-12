<template>
  <v-card>
    <v-file-input 
      label="File input" 
      id="picture"
      clearable 
      show-size counter multiple
      prepend-icon="mdi-camera"
      accept="image/*"
      @change="onFileSelected"
    ></v-file-input>
    <v-btn @click="uploadPicture" >upload picture</v-btn>
  </v-card>
</template>

<script>
  export default {
    name: 'CameraView',
    data() {
        return {

        }
    },
    methods: {
     
    },
  }
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

      // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          // Render thumbnail.
          var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null);
        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsDataURL(f);
    }
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);

</script>

<style scoped>
  .thumb {
    height: 75px;
    border: 1px solid #000;
    margin: 10px 5px 0 0;
</style>
