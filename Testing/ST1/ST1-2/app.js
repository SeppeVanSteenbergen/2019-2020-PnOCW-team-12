const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, { origins: '*:*' })
const socketController = require('./socketController')

socketController(io)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/socketio', (req, res) => {
  res.sendFile(__dirname + '/files/socket.io.js')
})
app.get('/client_script.js', (req, res) => {
  res.sendFile(__dirname + '/clientScript.js')
})

httpServer.listen(3000, () => {
  console.log('listening on port 3000')
})

process.stdin.resume()
process.stdin.setEncoding('utf8')

process.stdin.on('data', function(text) {
  text = text.trim()
  if (text.split(' ')[0] === 'e') {
    try {
      eval(text.slice(2, text.length))
    } catch (e) {
      console.log(e)
    }
  }
  if (text.split(' ')[0] === 'c') {
    try {
      eval('console.log(' + text.slice(2, text.length) + ')')
    } catch (e) {
      console.log(e)
    }
  }

  if (text === 'io') {
    console.log('getting io info')
  }

  if (text === 'quit') {
    done()
  }
})

function done() {
  console.log('Now that process.stdin is paused, there is nothing more to do.')
  process.exit()
}
