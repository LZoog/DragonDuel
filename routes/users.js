var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/:username', function(req, res, next) {
  var username = req.params.username;
  User.findOne({ username: username}, function(err, user) {
    if (err) console.log(err);
    res.render('user', {username: user.username, email: user.email});
  })
});

module.exports = router;
