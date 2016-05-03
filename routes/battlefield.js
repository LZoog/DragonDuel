var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');

function authenticatedUser(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('errorMessage', 'Login to access!');
  return res.redirect('/login');
}

/* GET battlefield */
router.get('/', authenticatedUser, function(req, res, next) {
  var user = global.currentUser.local;
  User.findOneAndUpdate({ 'local.username': user.username }, { 'local.battlefield': true }, function(err, user) {
    if (err) console.log(err);
  });

  User.find({ 'local.battlefield': true, 'local.level': user.level }, 'local.username local.level', function(err, users) {
    if (err) console.log(err);
      res.render('battlefield', {level: user.level, users: users});
  });
});

/* POST battlefield - leave */
router.post('/', function(req, res, next) {
  var user = global.currentUser.local;
  /* User is leaving the battlefield */
  if (req.body.leave) {
    User.findOneAndUpdate({ 'local.username': user.username }, { 'local.battlefield': false }, function(err, user) {
      if (err) console.log(err);
    });
    res.redirect(`/users/${user.username}`);
  }
});

module.exports = router;
