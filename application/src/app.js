const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const BodyParser = require('body-parser')
const expressSession = require('express-session')
const sessionFileStore = require('session-file-store')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, { origins: '*:*'})
const config = require('./config/config')
const routes = require('./routes')


app.use(morgan('combined'))  // adds connection logs to console

/* add routes to application */

routes(app)

/* add socket handler */

require('./controllers/socketController')(io)

/* start web server */

http.listen(config.server.port, function(){
  console.log('listening on port ' + config.server.port);
});

