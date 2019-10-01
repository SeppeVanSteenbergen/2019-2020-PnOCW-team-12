/**
 * This file returns a passport object with all implemented strategies.
 */
const passport = require('passport')
const guestStrategy = require('./guestStrategy')
const AnonymIdStrategy = require('passport-anonym-uuid')
//Adding all the strategies to the passport object
guestStrategy(passport)

passport.use(new AnonymIdStrategy())

// gets a user's main id to make a cookie out of it
passport.serializeUser(function(user, done) {
  console.log('SERIALIZING')
  console.log(user)
  done(null, user)
})

// sends a user to next function based on his id
// or any other type of ID determined by serializeUser
passport.deserializeUser(async function(user, done) {
  console.log('DESERIALIZING')
  //TODO add permissions to user
	done(null, user) // set the first row of data as the user
})

module.exports = passport
