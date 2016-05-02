var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/:username', function(req, res, next) {
  var username = req.params.username;
  console.log('username woooo', username);
  User.findOne({ 'local.username': username}, function(err, user) {
    if (err) console.log(err);
    console.log('entire user', user);
    res.render('user', {username: user.local.username, email: user.local.email});
  })
});

module.exports = router;
