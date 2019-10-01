const LocalStrategy = require('passport-local').Strategy

module.exports = passport => {
  let localStrategy = new LocalStrategy(function(username, password, done) {
    console.log('creating')
    var user = {
      id: 'guest-' + Math.random().toString
    }
    done(null, user)
  })

  passport.use('guest-strategy', localStrategy)
}
