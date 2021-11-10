const { Schema, model } = require('mongoose');
const Joi = require('joi');

const customerSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  isVip: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  }
})

const Customer = model('Customer', customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    isVip: Joi.boolean().required(),
    phone: Joi.string().min(5).max(50).required()
  })
  return schema.validate(customer);
}

module.exports = { Customer, validateCustomer };