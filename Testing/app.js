const express = require('express')
const bodyParser = require('body-parser')
const serveStatic = require('serve-static')
const path = require('path')
const app = express()
const fs = require('fs')

//app.use(serveStatic(path.join(__dirname, 'public')))
app.use((req, res, next) => {
  console.log(req.url)
  console.log(fs.existsSync(path.join(__dirname, '../client/src/algorithms' + req.url)))

  if (
    fs.existsSync(path.join(__dirname, '../client/src/algorithms' + req.url))
  ) {
    fs.readFile(
      path.join(__dirname, '../client/src/algorithms' + req.url),
      'utf8',
      function(err, data) {
        console.log('err')
        res.send(data.slice(data.search('export default') + 15))
      }
    )
  } else {
    console.log('next use')
    next()
  }
})

app.use(serveStatic(path.join(__dirname, 'pub2')))

//app.use(serveStatic(path.join(__dirname, '../screenDetection')))
//app.use(serveStatic(path.join(__dirname, '../barcodeScanner')))

app.listen(5000, () => {
  console.log('running on port 5000')
})
