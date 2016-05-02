var LocalStrategy = require('passport-local').Strategy;
var User          = require('../models/user');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      // If a user is found it will be assigned to req.user
      done(err, user);
    })
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, function(req, email, password, done) {

    // Find a user with this email
    User.findOne({ 'local.email' : email }, function(err, user) {
      if (err) return done(err);
      // If there is a user with this email
      if (user) {
        return done(null, false, req.flash('errorMessage', 'This email is already used!'));
      } else {
        User.findOne({ 'local.username' : req.body.username }, function(err, user) {
          if (err) return done(err);
          // If there is a user with this username
          if (user) {
            return done(null, false, req.flash('errorMessage', 'This username has been taken!'));
          } else {
            var newUser = new User();
            newUser.local.email = email;
            newUser.local.password = User.hash(password);
            newUser.local.username = req.body.username;
            newUser.local.gender = req.body.gender;

            newUser.save(function(err, user) {
              console.log(err);
              if (err) return done(err);
              return done(null, user);
            });
          }
        });
      }
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {

    // Search for a use with this email
    User.findOne({ 'local.email': email }, function(err, user) {
      if (err) return done(err);

      // If no user is found
      if (!user) return done(null, false, req.flash('errorMessage', 'No user found.'));

      // Check if the password is correct
      if (!user.validPassword(password)) return done(null, false, req.flash('errorMessage', 'Oops wrong password!'));

      return done(null, user);
    });

  }));
}
