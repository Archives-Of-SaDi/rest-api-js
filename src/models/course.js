const { Schema, model } = require('mongoose');
const Joi = require('joi');

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255,
  },
  category: {
    type: new Schema({
      name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
      },
    }),
    required: true,
  },
  trainer: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    required: true,
  },
  fee: {
    type: Number,
    required: true,
  },
});

const Course = model('course', courseSchema);

function validateCourse(course) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    categoryId: Joi.string().required(),
    trainer: Joi.string().required(),
    status: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    fee: Joi.number().min(0).required(),
  });

  return schema.validate(course);
}

module.exports = { Course, validateCourse };
