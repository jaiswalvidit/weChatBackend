const mongoose = require('mongoose');
const { Schema } = mongoose; 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSchema = new Schema({
name:{
  type:String,
  required:true,
  
},
email:{
  type:String,
  required:true,
  unique:true,
},
picture: {
  type: String,
  required: true,
  default:'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-male-user-icon.png'
},
password: {
  type: String,
  required: true,
  select: true
},
createdAt: {
    type: Date,
    default: Date.now 
  }
}, { timestamps: true });


const User = mongoose.model('User', UserSchema);

module.exports = User;
