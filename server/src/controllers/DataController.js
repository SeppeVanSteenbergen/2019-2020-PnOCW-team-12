const dataHelper = require('../helpers/dataHelper')
const fs = require('fs')
const path = require('path')
const Config = require('../config/config')

module.exports = {
  getAllRooms(req, res) {
    const rooms = dataHelper.getAllRooms()

    res.send(rooms)
  },
  /**
   * returns a stream from a given video
   *
   * Inspired from https://stackoverflow.com/questions/24976123/streaming-a-video-file-to-an-html5-video-player-with-node-js-so-that-the-video-c
   */
  streamVideo(req, res) {
    let filename = req.url.replace('/video/', '').replace('/', '')
    let file = path.resolve(path.join(__dirname, '../../', 'files', filename))

    console.log(path.join(__dirname, '../../', 'files', filename))
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
  },
  getImage(req, res) {
    let filename = req.url.replace('/image/', '').replace('/', '')
    res.sendFile(path.resolve(path.join(__dirname, '../../', 'files', filename)))
  },
  /**
   * downloads the video file as a
   * @param req
   * @param res
   * @returns {*}
   */
  videoUpload(req, res) {
    const file = req.file
    if (!file) {
      return res.status(404)
    }
    res.send({
      videoURL: Config.server.url + '/video/' + file.filename
    })
  },
  imageUpload(req, res) {
    const file = req.file
    if (!file) {
      return res.status(404)
    }
    res.send({
      imageURL: Config.server.url + '/image/' + file.filename
    })
  }
}
