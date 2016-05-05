var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');

// var app = express();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

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

      //then set battlefield to true for current user, emit event to all connected
      User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': true }, function(err, user) {
        if (err) console.log(err);
          res.render('battlefield', {level: currentUser.level, power: currentUser.power, username: currentUser.username, users: users});
          setTimeout(function(){io.sockets.emit('newUser', user.local)}, 100);
      });
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
        //
        io.sockets.emit('leftField', user.local);
      });
      res.redirect(`/users/${currentUser.username}`);
      /* Else, user has clicked on another user */
    } else {
      var connUsername = req.body.connUsername;
      var yourPower = req.body.yourPower;
      var connPower = req.body.connPower;
      var currentLevel = parseInt(req.body.currentLevel);
      var upLevel = currentLevel + 1;
      var downLevel = currentLevel - 1;

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
        console.log('got to win()');
        //you go up a level
        User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': upLevel }, function(err, user) {
          if (err) console.log(err);
          // if opponent is on level 1, remove them from battlefield, emit event to that user (jQuery)
          if (currentLevel == 1) {
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.battlefield': false }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('removeFromField', connUsername);
              res.send('win');
            });
          } else {
            console.log('downLevel',downLevel);
            //find opposing user & make them go down a level
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('newUser', user);
              res.send('win');
            });
          }
        });
      };

      function lose() {
        console.log('got to lose()');
        //this only happens if user clicks on another user with stronger power
        // if you're level 1 you're removed from field
        if (currentLevel == 1) {
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': false }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('removeFromField', connUsername);
            res.send('lose');
          });
        } else {
          //otherwise you go down a level
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': downLevel }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('newUser', user);
            res.send('lose');
          });
        }
      };

      function tie() {
        console.log('got to tie()');
        // if you're on level 1 both you and your opponent are removed from the field
        if (currentLevel == 1) {
          //current user
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': false }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('removeFromField', currentUser.username);
            //opponent
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.battlefield': false }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('removeFromField', connUsername);
              res.send('lose');
            });
          });
        } else {
          //otherwise you both go down a level
          //current user
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': downLevel }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('newUser', user);
            //opponent
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('newUser', user);
              res.send('lose');
            });
          })
        }
      };

    }
  });
  return router;
};

module.exports = returnRouter;
