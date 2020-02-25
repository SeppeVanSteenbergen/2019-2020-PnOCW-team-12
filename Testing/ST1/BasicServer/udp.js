const udp = require('dgram')

const server = udp.createSocket('udp4')

server.on('error', error => {
  console.log('Error: ' + error)
  server.close()
})

server.on('message', (msg, info) => {
  console.log('Message: ' + msg.toString())
  console.log(
    'Received %d bytes from %s:%d\n',
    msg.length,
    info.address,
    info.port
  )

  server.send(msg, info.port, 'localhost', error => {
    if (error) {
      server.close()
    } else {
      console.log('Sent data')
    }
  })
})

server.bind(2222)

/*setTimeout(function() {
  server.close()
}, 8000)*/
