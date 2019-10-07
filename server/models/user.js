const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jwt = require("jsonwebtoken");
const secret = "secret";

const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = new Schema({
  email: {
    type: String,
    // regExp source: https://emailregex.com/
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    // regExp adapted from: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
    match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z])(?=.{8,})/,
    required: true
  },
  token: String
});

User.pre("save", function(next) {
  if (!this.isModified("password")) next();
  this.password = bcrypt.hashSync(this.password, saltRounds);
  this.token = this.getToken();
  next();
});

User.methods.comparePassword = function(password, done) {
  done(bcrypt.compareSync(password, this.password));
};

User.methods.getToken = function() {
  return jwt.sign({ email: this.email }, secret);
};

User.statics.decodeToken = function(token) {
  return jwt.verify(token, secret);
};

module.exports = mongoose.model("User", User);
