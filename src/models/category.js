const { Schema, model } = require('mongoose');
const Joi = require('joi');

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  }
})

const Category = model('category', categorySchema);

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(50)
  })

  return schema.validate(category);
}

module.exports = { Category, validateCategory, categorySchema };