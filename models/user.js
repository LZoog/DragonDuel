var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: { type: String, unique: true},
  password: {type: String},
  gender: {type: String},
  color: {type: String},
  team: {type: String},
  level: {type: Number, default: 1},
  total_time: {type: String},
  temp_time: {type: String},
  dragon_name: {type: String},
  created_at: Date
});

var User = mongoose.model('User', userSchema);
module.exports = User;
