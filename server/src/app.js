const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const FileStore = require('session-file-store')(expressSession)
const cookieParser = require('cookie-parser')
const app = express()
const config = require('./config/config')
const routes = require('./routes')
const passport = require('./auth')
const https = require('https')
const fs = require('fs')
const path = require('path')
const credentials = {
  key: fs.readFileSync((!config.dev && !config.kul)?'/ssl/key.pem':path.join(__dirname, 'keys/private.key'), 'utf8'),
  cert: fs.readFileSync((!config.dev && !config.kul)?'/ssl/cert.pem':path.join(__dirname, 'keys/certificate.crt'), 'utf8')
}
const httpsServer = https.createServer(credentials, app)

const httpServer = require('http').createServer(app)

let io
if (config.secure) {
  io = require('socket.io')(httpsServer, { origins: '*:*', pingTimeout: 20000 })
} else {
  io = require('socket.io')(httpServer, { origins: '*:*' })
}

// adds connection logs to console
app.use(morgan('combined'))

// parses json messages into objects
app.use(bodyParser.json())

// to extract cookies from request
app.use(cookieParser())

// allows connection from any origin + cookies
app.use(cors({ credentials: true, origin: config.client.url }))

// exporting io object
exports.io = io

//----PASSPORT----//
// This will tell passport if the user is already logged in

app.use(
  expressSession({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    name: config.session.name,
    cookie: {
      maxAge: 604800000 // 7 days in milliseconds
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())

/* add routes to application */
routes(app, passport)

/* add socket handler */

require('./controllers/socketController')(io)

/* start web server */

if (config.secure) {
  /* https server */
  httpsServer.listen(config.server.port, () => {
    console.log(
      'listening on port ' + config.server.port + ' using https protocol'
    )
  })

  // Redirecting to https
  const httpApp = express()

  httpApp.get('*', function(req, res) {
    console.log('Redirect server running')
    res.redirect('https://' + req.headers.host + req.path)
  })
  httpApp.listen(80)
} else {
  /* http server */
  httpServer.listen(config.server.port, function() {
    console.log('listening on port ' + config.server.port)
  })
}
