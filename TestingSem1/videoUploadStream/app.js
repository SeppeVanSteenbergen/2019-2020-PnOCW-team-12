const express = require('express')

const multer = require('multer')
const path = require('path')
const fs = require('fs')

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'files')
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

let upload = multer({ storage: storage })

const app = express()

app.post('/upload', upload.single('vid'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(file)
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/player', (req, res) => {
  res.sendFile(__dirname + '/player.html')
})

app.get('/video/*', (req, res) => {
  let filename = req.url.replace('/video/', '').replace('/', '')
  let file = path.resolve(__dirname, 'files/' + filename)

  console.log(filename)
  fs.stat(file, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.sendStatus(404)
      }
      res.end(err)
    }
    let range = req.headers.range
    if (!range) {
      // 416 Wrong range
      return res.sendStatus(416)
    }
    let positions = range.replace(/bytes=/, '').split('-')
    let start = parseInt(positions[0], 10)
    let total = stats.size
    let end = positions[1] ? parseInt(positions[1], 10) : total - 1
    let chunksize = end - start + 1

    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    })

    let stream = fs
      .createReadStream(file, { start: start, end: end })
      .on('open', function() {
        stream.pipe(res)
      })
      .on('error', function(err) {
        res.end(err)
      })
  })
})

app.listen(9000, () => {
  console.log('hello buds')
})
