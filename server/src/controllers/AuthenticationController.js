const config = require('../config/config')

module.exports = {
	logout(req, res) {
		req.logout()
		res.clearCookie(config.session.name)
		res.redirect('/')
	},
	/**
   * logs in the user using a session cookie and returns the needed user data for basic login
   *
   * @pre must have the isAuthenticated policy prior to calling this
   * @param req
   * @param res
   */
  sessionLogin(req, res) {
    res.send({
      status: 'success',
      message: 'successfully logged into session',
      user: req.user
    })
  },
  tryLogin(req, res, next) {
  	console.log('the user is')
  	console.log(req.user)
  	if(typeof req.user !== 'undefined') {
  		console.log('sending back user info')
  		res.send({
  			status:'success',
  			user: req.user
  		})
  	} else {
  		console.log('so creating new one')
  		next()
  	}
  }
}