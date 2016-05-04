var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  local : {
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true},
    password: {type: String, required: true},
    gender: {type: String},
    color: {type: String},
    power: {type: String},
    team: {type: String},
    dragon_name: {type: String, default: 'Drogon'},
    battlefield: {type: Boolean, default: false},
    level: {type: Number, default: 1},
    highest_lvl_total: {type: Number, default: 0},
    highest_lvl_temp: {type: Date},
    created_at: {type: Date, default: Date.now}
  }
});

userSchema.statics.hash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
}

var User = mongoose.model('User', userSchema);
module.exports = User;
