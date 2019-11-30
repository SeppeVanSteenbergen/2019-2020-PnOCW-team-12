const fs = require('fs')
const serveStatic = require('serve-static')
const path = require('path')
const AuthenticationPolicy = require('./policies/AuthenticationPolicy')
const AuthenticationController = require('./controllers/AuthenticationController')
const DataController = require('./controllers/DataController')
const multer = require('multer')
const upload = multer({dest: './uploads/images/'})

module.exports = (app, passport) => {
  app.get('/test', (req, res) => {
    let cookies = req.cookies.login
    res.send('the test worked: ' + req.user.uuid)
  })

  app.get(
    '/login/guest',
    AuthenticationController.tryLogin,

    passport.authenticate('anonymId', { session: true }),
    (req, res) => {
      console.log(req.user)
      res.send({ status: 'success', user: req.user })
    }
  )

  app.get('/logout', AuthenticationController.logout)

  app.get(
    '/login/session',
    AuthenticationPolicy.isAuthenticated,
    AuthenticationController.sessionLogin
  )

  app.get(
    '/room/roomList',
    AuthenticationPolicy.isAuthenticated,
    DataController.getAllRooms
  )

  app.get('/auth/regSocketKey', AuthenticationController.getSocketRegistrationKey)
  app.post('/upload', upload.single("file"), (req, res) => {
    res.json({file: req.file});
  })
  app.use('/', serveStatic(path.join(__dirname, '../dist')))

  app.get('/video/*', AuthenticationPolicy.isAuthenticated, DataConroller.streamVideo)

  app.use((req, res) => {
    fs.readFile(
      path.join(__dirname, '../dist/index.html'),
      'utf-8',
      (err, content) => {
        if (err) {
          console.log(err)
          console.log('cannot open file')
        }
        console.log('got the file')
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8'
        })

        res.end(content)
      }
    )
  })
}
