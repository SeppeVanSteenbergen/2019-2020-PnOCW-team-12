const dataHelper = require('../helpers/dataHelper')
const fs = require('fs')
const path = require('path')

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
    const fileName = req.url

  }
}
