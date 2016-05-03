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

    //{ $or: [{ 'local.email': email }, { 'local.username': req.body.username }]}
    User.findOne({ 'local.email' : email }, function(err, user) {
      if (err) return done(err);
      // If there is a user with this email
      if (user) {
        return done(null, false, req.flash('errorMessage', 'This email is already being used!'));
      } else {
        User.findOne({ 'local.username' : req.body.username }, function(err, user) {
          if (err) return done(err);
          // If there is a user with this username
          if (user) {
            return done(null, false, req.flash('errorMessage', 'This username has been taken!'));
          } else {
            var light = 0, dark = 0;
            var team, power, color;

            if (req.body.q1 == 'sun')
              { light++; } else { dark++; }
            if (req.body.q2 == 'fairy' || req.body.q2 == 'unicorn')
              { light++; } else { dark++; }
            if (req.body.q3 == 'opal' || req.body.q3 == 'diamond' || req.body.q3 == 'pearl')
              { light ++; } else { dark++; }
            if (req.body.q4 == 'fame' || req.body.q4 == 'achievement')
              { light++; } else { dark++; }
            if (req.body.q5 == 'no')
              { light++; } else { dark++; }

            var rand = Math.floor(Math.random()*3);

            if (light > dark) {
              team = 'light';
              var powers = ['lightning', 'fire', 'mind reading'];
              var colors = ['yellow', 'orange', 'green'];
              power = powers[rand];
              color = colors[rand];
            } else {
              team = 'dark';
              var powers = ['darkness', 'ice', 'psychic'];
              var colors = ['red', 'blue', 'purple']
              power = powers[rand];
              color = colors[rand];
            }

            var newUser = new User();
            newUser.local.email = email;
            newUser.local.password = User.hash(password);
            newUser.local.username = req.body.username;
            newUser.local.gender = req.body.gender;
            newUser.local.color = color;
            newUser.local.power = power;
            newUser.local.team = team;

            newUser.save(function(err, user) {
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
