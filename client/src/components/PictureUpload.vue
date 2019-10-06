<template>
  <v-card>
    <v-file-input
      label="File input"
      id="inpFile"
      clearable
      show-size
      counter
      multiple
      prepend-icon="mdi-camera"
      accept="image/*"
      @change="onFileSelected"
    ></v-file-input>
    <v-btn>Upload Picture</v-btn>
    <div class="image-preview" id="imagePreview">
      <img src="" alt="Image Preview" class="image-preview__image" />
      <span class="image-preview__default-text">Image Preview</span>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'PictureUpload',
  data() {
    return {}
  },
  methods: {
    onFileSelected() {
      const inpFile = document.getElementById('inpFile')
      const previewContainer = document.getElementById('imagePreview')
      const previewImage = previewContainer.querySelector(
        '.image-preview__image'
      )
      const previewDefaultText = previewContainer.querySelector(
        '.image-preview__default-text'
      )
      inpFile.addEventListener('change', function() {
        const file = this.files[0]

        if (file) {
          const reader = new FileReader()

          previewDefaultText.style.display = 'none'
          previewImage.style.display = 'block'

          reader.addEventListener('load', function() {
            previewImage.setAttribute('src', this.result)
          })

          reader.readAsDataURL(file)
        } else {
          previewDefaultText.style.display = null
          previewImage.display = null
          previewImage.setAttribute('src', '')
        }
      })
    }
  }
}
</script>

<style scoped>
.image-preview {
  width: 300px;
  min-height: 100px;
  border: 2px soid #dddddd;
  margin-top: 15px;

  /* text settings */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #cccccc;
}

.image-preview__image {
  display: none;
  width: 100%;
}
</style>
