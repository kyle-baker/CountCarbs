'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true, min: 10},
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hashSync(password, 10);
};

const User = mongoose.model('User', UserSchema);

const ItemSchema = mongoose.Schema({
  name: {type: String, required: true},
  carbs: {type: Number, required: true},
  calories: {type: Number, required: true},
  serving: {type: String, required: true},
  publicAccess: {type: Boolean, required: true}
})

const CarbItem = mongoose.model('CarbItem', ItemSchema);

module.exports = {User, CarbItem};