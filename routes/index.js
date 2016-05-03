var express = require('express');
var passport = require("passport");
var router = express.Router();

function unAuthenticatedUser(req, res, next) {
  if (!req.isAuthenticated()) return next();
  req.flash('errorMessage', 'You are already logged in!');
  return res.redirect('/');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
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
