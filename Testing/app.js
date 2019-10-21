const express = require('express')
const bodyParser = require('body-parser')
const serveStatic = require('serve-static')
const path = require('path')
const app = express()
const fs = require('fs')

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(serveStatic(path.join(__dirname, '../screenDetection')))

app.get('/file-list', (req, res) => {
  fs.readdir('./public/Images', (err, files) => {
    let imageList = []
    for(let i = 0; i < files.length; i++) {
      imageList.push('Images/' + files[i])
    }
    res.send(imageList)
  })
})
app.listen(5000, () => {
  console.log('running on port 5000')
})
