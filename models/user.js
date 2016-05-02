var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true},
  password: {type: String, required: true},
  gender: {type: String},
  color: {type: String},
  team: {type: String},
  level: {type: Number, default: 1},
  highest_lvl_total: {type: Number, default: 0},
  highest_lvl_temp: {type: Date},
  dragon_name: {type: String},
  created_at: {type: Date, default: Date.now}
});

var User = mongoose.model('User', userSchema);
module.exports = User;
