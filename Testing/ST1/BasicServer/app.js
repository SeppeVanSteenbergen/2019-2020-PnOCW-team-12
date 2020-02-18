const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, { origins: '*:*' })

exports.io = io

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.get('/socket.io', (req, res) => {
  res.sendFile(__dirname + '/files/socket.io.js')
})
app.get('/client_script.js', (req, res) => {
  res.sendFile(__dirname + '/clientScript.js')
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
