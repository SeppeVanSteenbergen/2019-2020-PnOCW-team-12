let Buffer = require('buffer')

var udp = require('dgram')
let client = udp.createSocket('udp4')

let data = Buffer.from('test')

client.on('message', (msg, info) => {
  console.log('Data received from server : ' + msg.toString())
  console.log(
    'Received %d bytes from %s:%d\n',
    msg.length,
    info.address,
    info.port
  )
})

client.send(data, 2222, 'localhost', function(error) {
  if (error) {
    client.close()
  } else {
    console.log('Data sent !!!')
  }
})

let data1 = Buffer.from('hello')
let data2 = Buffer.from('world')

//sending multiple msg
client.send([data1, data2], 2222, 'localhost', function(error) {
  if (error) {
    client.close()
  } else {
    console.log('Data sent !!!')
  }
})
