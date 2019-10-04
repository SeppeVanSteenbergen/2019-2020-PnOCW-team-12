module.exports = {
  isAuthenticated(req, res, next) {
    if (typeof req.user === 'undefined') {
      res.status(403).send({
        status: 'error',
        message: 'The user has to be logged in to use this route'
      })
    } else {
      next()
    }
  },

  isLoggedOff(req, res, next) {
    if (typeof req.user !== 'undefined') {
      res.status(403).send({
        status: 'error',
        message: 'The user cannot be logged in to use this route'
      })
    } else {
      next()
    }
  }
}
