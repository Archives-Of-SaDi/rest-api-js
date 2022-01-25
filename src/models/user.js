const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { string } = require('joi');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1024
  },
  isAdmin: {
    type: Boolean,
    required: true
  }
})

const User = model('user', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(3).max(255).required(),
    isAdmin: Joi.boolean().required()
  })

  return schema.validate(user);
}

module.exports = { User, validateUser };