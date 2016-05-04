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
    User.find({ 'local.battlefield': true, 'local.level': currentUser.level }, 'local.username local.level local.power local.color', function(err, users) {
      if (err) console.log(err);

      //then set battlefield to true for current user, emit event to all connected
      User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.battlefield': true }, function(err, user) {
        if (err) console.log(err);
          io.sockets.emit('newUser', user.local);
          res.render('battlefield', {level: currentUser.level, power: currentUser.power, users: users});
          setTimeout(function(){io.sockets.emit('newUser', user.local)}, 2000);
      });
    });
  });

  router.get('/get', function (req, res, next) {
    var currentUser = req.user.local;

    User.find({'local.battlefield': true, 'local.level': currentUser.level, 'local.username': {$ne: currentUser.username} }, 'local.username local.power local.color', function(err, users) {
      if (err) console.log(err);
      console.log(users);
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
      });
      res.redirect(`/users/${currentUser.username}`);
      /* Else, user has clicked on another user */
    } else {
      var connUsername = req.body.connUsername;
      var yourPower = req.body.yourPower;
      var connPower = req.body.connPower;

      function win() {
        User.findOneAndUpdate({ 'local.username': connUsername }, { 'local.level': 1 }, function(err, user) {
          if (err) console.log(err);
        });
        User.findOneAndUpdate({ 'local.username': currentUser.username }, { 'local.level': 2 }, function(err, user) {
          if (err) console.log(err);
        });
        res.send('win');
      }

      if (yourPower == 'lightning' && connPower == 'psychic') {
        win();
      } else if (yourPower == 'fire' && connPower == 'darkness') {
        console.log('your power is fire & theirs is darkness');
        win();
      } else if (yourPower == 'mind reading' && connPower == 'ice') {
        win();
      } else if (yourPower == 'darkness' && connPower == 'mind reading') {
        win();
      } else if (yourPower == 'ice' && connPower == 'lightning') {
        win();
      } else if (yourPower == 'psychic' && connPower == 'fire') {
        win();
      }
    }
  });
  return router;
};

module.exports = returnRouter;
