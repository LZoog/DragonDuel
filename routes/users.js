var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/:username', function(req, res, next) {
  var username = req.params.username;
  User.findOne({ 'local.username': username}, function(err, user) {
    if (err) console.log(err);
    res.render('user', {username: user.local.username, gender: user.local.gender, level: user.local.level, team: user.local.team, color: user.local.color, power: user.local.power, dragon: user.local.dragon_name});
  })
});

module.exports = router;
