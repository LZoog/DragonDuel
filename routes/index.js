var express = require('express');
var passport = require("passport");
var router = express.Router();
var passport = require("passport");
var User = require('../models/user');

function unAuthenticatedUser(req, res, next) {
  if (!req.isAuthenticated()) return next();
  req.flash('errorMessage', 'You are already logged in!');
  return res.redirect('/');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  User.findOne({ 'local.level': 2 }, function(err, user) {
    if (err) console.log(err);
    res.render('index', {req: req, username: user.local.username, dragon: user.local.dragon_name, team: user.local.team, color: user.local.color, level: user.local.level});
  });
});

/* GET /signup */
router.get('/signup', unAuthenticatedUser, function(req, res, next) {
  res.render('signup', { message: req.flash('errorMessage') });
});

/* POST /signup */
router.post('/signup', function(req, res, next) {
  var signupStrategy = passport.authenticate('local-signup', {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
  });
  return signupStrategy(req, res);
});

/* GET /login */
router.get('/login', unAuthenticatedUser, function(req, res, next) {
  res.render('login', { message: req.flash('errorMessage') });
});

/* POST /login */
router.post('/login', function(req, res, next) {
  var loginStrategy = passport.authenticate('local-login', {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  });
  return loginStrategy(req, res);
});

/* GET /logout */
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
