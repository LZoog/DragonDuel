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
  var socket;
  router.get('/', authenticatedUser, function(req, res, next) {

    io.on('connection', function(client){
      socket = client;
    });

    var currentUser = req.user.local;
    //find all users in the battlefield & on the same level
    User.find({ 'local.battlefield': true, 'local.level': currentUser.level, 'local.username': {$ne: currentUser.username} }, 'local.username local.level local.power local.color', function(err, users) {
      if (err) console.log(err);

      //then set battlefield to true for current user, emit event to all connected
      User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': true }, function(err, user) {
        if (err) console.log(err);
        console.log(socket, 'YOU ARE FUCKING AWESOME');
          res.render('battlefield', {req: req, link: 'no', level: currentUser.level, power: currentUser.power, username: currentUser.username, users: users, req: req});
          setTimeout(function(){io.sockets.emit('newUser', user.local)}, 200);
          setTimeout(function(){socket.emit('test', 'YOU ARE FUCKING AWESOME')}, 500);
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
        io.sockets.emit('leftField', user.local);
      });
      res.redirect(`/users/${currentUser.username}`);

      /* Else, user has clicked on another user & will win, lose, or tie */
    } else {
      console.log(req.body);
      console.log('.connUsername', req.body.connUsername);
      console.log('.username', req.body.username);
      console.log('.level', req.body.level);
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
        console.log('got to win()');

        //you go up a level
        var upLevel = currentLevel + 1;
        User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': upLevel }, function(err, user) {
          if (err) console.log(err);
          //test this
          console.log('updated user, about to emit');
          console.log('user.local',user.local);
          //fix this, is not sending correct user.local.level
          //io.sockets.emit('newUser', user.local);

          // if opponent is on level 1, remove them from battlefield
          if (currentLevel == 1) {
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.battlefield': false }, function(err, user) {
              if (err) console.log(err);
              console.log('connUsername',connUsername);
              console.log('currentUser.username',currentUser.username);
                console.log('before emit');
                /* setTimeout(function(){*/
                io.sockets.emit('removeFromField', connUsername)
              /*}, 2000);*/
              res.send('win');
            });
          } else {
            //find opposing user & make them go down a level
            var downLevel = currentLevel - 1;
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('newUser', user.local);
              //io.sockets.emit('getLevel', user.local.username);
              res.send('win');
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
            io.sockets.emit('removeFromField', currentUser.username);
            io.sockets.emit('leftField', user.local);
            res.send('lose');
          });
        } else {
          //otherwise you go down a level
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': downLevel }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('newUser', user.local);
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
              res.send('tie');
            });
          });
        } else {
          //otherwise you both go down a level
          //current user
          User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': downLevel }, function(err, user) {
            if (err) console.log(err);
            io.sockets.emit('newUser', user.local);
            io.sockets.emit('leftField', user.local);
            //opponent
            User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': downLevel }, function(err, user) {
              if (err) console.log(err);
              io.sockets.emit('newUser', user.local);
              io.sockets.emit('leftField', user.local);
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
