const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// require('mongoose-currency').loadType(mongoose);
// const Currency = mongoose.Types.Currency

// here is the schema for our user
// and this will be used as a format for the log in
const User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

var Users = mongoose.model('User', User);

module.exports = Users;
