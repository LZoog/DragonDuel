var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');

var returnRouter = function(io) {

  function authenticatedUser(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.flash('errorMessage', 'Login to access!');
    return res.redirect('/login');
  }

  /* GET battlefield */
  router.get('/', authenticatedUser, function(req, res, next) {

    var currentUser = req.user.local;
    //find all users in the battlefield & on the same level
    User.find({ 'local.battlefield': true, 'local.level': currentUser.level, 'local.username': {$ne: currentUser.username} }, 'local.username local.level local.power local.color', function(err, users) {
      if (err) console.log(err);

      res.render('battlefield', {link: 'no', level: currentUser.level, power: currentUser.power, username: currentUser.username, users: users});

      //then set battlefield to true for current user, emit event
      if (currentUser.battlefield == false) {
        User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': true }, function(err, user) {
          if (err) console.log(err);
            setTimeout(function(){io.sockets.emit('newUser', user.local)}, 200);
        });
      }
    });
  });

  /*GET current level users (happens on level change) */
  router.get('/update', function (req, res, next) {
    var currentUser = req.user.local;

    User.find({'local.battlefield': true, 'local.level': currentUser.level, 'local.username': {$ne: currentUser.username} }, 'local.username local.power local.color local.level', function(err, users) {
      if (err) console.log(err);
      res.json({users: users, power: currentUser.power});
    });
  });

  /* POST battlefield */
  router.post('/', function(req, res, next) {
    var currentUser = req.user.local;

    /* User is leaving the battlefield */
    if (req.body.leave) {
      User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': false }, function(err, user) {
        if (err) console.log(err);
         io.emit('removeFromField', user.local);
      });
      res.redirect(`/users/${currentUser.username}`);

      /* Else, user has clicked on another user & will win, lose, or tie */
    } else {
      var connUsername = req.body.connUsername || req.body.username;
      var yourPower = req.body.yourPower;
      var connPower = req.body.connPower;
      var currentLevel = currentUser.level;

      if (yourPower == 'lightning') {
        if (connPower == 'psychic') {
          win();
        } else if (connPower == 'ice') {
          lose();
        } else {
          tie();
        }
      } else if (yourPower == 'fire') {
        if (connPower == 'darkness') {
          win();
        } else if (connPower == 'psychic') {
          lose();
        } else {
          tie();
        }
      } else if (yourPower == 'mind reading') {
        if (connPower == 'ice') {
          win();
        } else if (connPower == 'darkness') {
          lose();
        } else {
          tie();
        }
      } else if (yourPower == 'darkness') {
        if (connPower == 'mind reading') {
          win();
        } else if (connPower == 'fire') {
          lose();
        } else {
          tie();
        }
      } else if (yourPower == 'ice') {
        if (connPower == 'lightning') {
          win();
        } else if (connPower == 'mind reading') {
          lose();
        } else {
          tie();
        }
      } else if (yourPower == 'psychic') {
        if (connPower == 'fire') {
          win();
        } else if (connPower == 'lightning') {
          lose();
        } else {
          tie();
        }
      }

      function win() {
        // user goes up a level
        var upLevel = currentLevel + 1;
        // remove user from level for other users {✓}
        setTimeout(function(){io.emit('removeFromField', currentUser)}, 500);

        User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': upLevel }, {new: true}, function(err, user) {
          if (err) console.log(err);
          // add user to new level for other users {✓}
          io.emit('newUser', user.local);

          // if opponent is on level 1
          if (currentLevel == 1) {
            // set opponent battlefield to false
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.battlefield': false }, function(err, user) {
              if (err) console.log(err);
              // send opponent to UL {✓}
              io.emit('sendToUL', connUsername);
              // remove opponent from level for other users {✓}
              io.emit('removeFromField', user.local);
              console.log(currentUser);

              // get new user level {✓}
              User.find({'local.battlefield': true, 'local.level': upLevel, 'local.username': {$ne: currentUser.username} }, 'local.username local.power local.color local.level', function(err, users) {
                if (err) console.log(err);
                console.log(users);
                res.json({users: users, power: currentUser.power});
              });
            })
          } else {
            // opponent is on level 2+, find & make them go down a level
            var downLevel = currentLevel - 1;
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, {new: true}, function(err, user) {
              if (err) console.log(err);
              // show opponent on new level for other users{✓}
              io.emit('newUser', user.local);
              // remove opponent from level for other users (sending data from before doc update){✓}
              io.emit('removeFromField', { level: currentLevel, username: connUsername });

              //get new opponent's level
              User.find({'local.battlefield': true, 'local.level': downLevel, 'local.username': {$ne: connUsername} }, 'local.username local.power local.color local.level', function(err, usersOpp) {
                if (err) console.log(err);
                console.log('opponents level', usersOpp);
                // does not work
                io.emit('getLevel', {users: usersOpp, power: currentUser.power, username: connUsername});

                // get new user level
                User.find({'local.battlefield': true, 'local.level': upLevel, 'local.username': {$ne: currentUser.username} }, 'local.username local.power local.color local.level', function(err, users) {
                  if (err) console.log(err);
                  console.log('new user level', users);
                  res.json({users: users, power: currentUser.power});
                });
              });
            });
          }
        });
      }

      function lose() {
        console.log('got to lose()');
        //this only happens if user clicks on another user with stronger power
        // if you're level 1 you're removed from field
        if (currentLevel == 1) {
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': false }, function(err, user) {
            if (err) console.log(err);
            io.emit('sendToUL', currentUser.username);
            io.emit('removeFromField', user.local);
            res.end();
          });
        } else {
          // if you're level 2+ you go down a level
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': downLevel }, {new: true}, function(err, user) {
            if (err) console.log(err);
            // remove user from level they were on for other users
            io.emit('removeFromField', user.local);
            // load new level
            io.emit('getLevel', user.local.username);
            // add user to level -1 for other users
            io.emit('newUser', user.local);
            res.send('lose');
          });
        }
      };

      function tie() {
        console.log('got to tie()');
        // if user & opponent are on level 1, both are removed from the field
        if (currentLevel == 1) {
          // user
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': false }, function(err, user) {
            if (err) console.log(err);
            io.emit('sendToUL', currentUser.username);
            //opponent
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.battlefield': false }, function(err, user) {
              if (err) console.log(err);
              io.emit('sendToUL', connUsername);
              res.end();
            });
          });
        } else {
          //otherwise you both go down a level
          //current user
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': downLevel }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('newUser', user.local);
            io.sockets.emit('removeFromField', user.local);
            //opponent
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('newUser', user.local);
              io.sockets.emit('removeFromField', user.local);
              //io.sockets.emit('getLevel', user.local.username);
              res.send('tie');
            });
          })
        }
      };
    }
  });
  return router;
};

module.exports = returnRouter;
