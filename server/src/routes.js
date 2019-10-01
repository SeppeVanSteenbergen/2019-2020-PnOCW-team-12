const fs = require('fs');
const serveStatic = require('serve-static')
const path = require('path')
const AuthenticationPolicy = require('./policies/AuthenticationPolicy')
const AuthenticationController = require('./controllers/AuthenticationController')

module.exports = (app, passport) => {

    app.get('/test', (req, res) => {
    		let cookies = req.cookies.login
        res.send('the test worked: ' + req.user.uuid)
    })


    app.get('/login/guest', AuthenticationController.tryLogin, (req, res, done)=> {
    	console.log('going to login')
    	done()
    },


    	passport.authenticate('anonymId', {session:true}),
    	(req, res) => {
    		console.log(req.user)
    		res.send({status: 'success', user: req.user})
    	}
    )


    app.get('/logout', AuthenticationController.logout)

    app.get('/login/session', AuthenticationPolicy.isAuthenticated, AuthenticationController.sessionLogin)










    app.use("/", serveStatic(path.join(__dirname, '/dist2')))


    app.use((req, res) => {
        fs.readFile('dist2/index.html', 'utf-8', (err, content) => {
            if (err) {
            	console.log(err)
                console.log('cannot open file')
            }
            console.log('got the file')
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8'
            })

            res.end(content)
        })
    })
}