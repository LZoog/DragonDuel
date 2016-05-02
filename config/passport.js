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
            var light = 0, dark = 0;
            var team, power, color;

            var q1 = req.body.q1;
            if (q1 == 'sun') { light++;
            } else { dark++; }
            var q2 = req.body.q2;
            if (q2 == 'fairy' || q2 == 'unicorn') { light++;
            } else { dark++; }
            var q3 = req.body.q3;
            if (q3 == 'opal' || q3 == 'diamond' || q3 == 'pearl') { light ++;
            } else { dark++; }
            var q4 = req.body.q4;
            if (q4 == 'fame' || q4 == 'achievement') { light++;
            } else { dark++; }
            var q5 = req.body.q5;
            if (q5 == 'no') { light++;
            } else { dark++; }

            var rand = Math.floor(Math.random()*3);

            if (light > dark) {
              team = 'Light';
              var powers = ['Lightning', 'Fire', 'Mind Reading'];
              var colors = ['Yellow', 'Orange', 'Green'];
              power = powers[rand];
              color = colors[rand];
            } else {
              team = 'Dark';
              var powers = ['Darkness', 'Ice', 'Psychic'];
              var colors = ['Red', 'Blue', 'Purple']
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
