const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const expressSession = require('express-session')
const FileStore = require('session-file-store')(expressSession)
const cookieParser = require('cookie-parser')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, { origins: '*:*'})
const config = require('./config/config')
const routes = require('./routes')
const passport = require('./auth')

// adds connection logs to console
app.use(morgan('combined'))  

// parses json messages into objects
app.use(bodyParser.json())

// to extract cookies from request
app.use(cookieParser())

// allows connection from any origin + cookies
app.use(cors({ credentials: true, origin: config.client.url }))


//----PASSPORT----//
// This will tell passport if the user is already logged in

app.use(
  expressSession({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    name: config.session.name,
    cookie:{
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

http.listen(config.server.port, function(){
  console.log('listening on port ' + config.server.port);
});

