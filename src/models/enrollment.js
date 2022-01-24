const { Schema, model } = require('mongoose');
const Joi = require('joi');

const enrollmentSchema = new Schema({
  customer: {
    type: new Schema({
      name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      }
    }),
    required: true
  },
  course: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 255
      }
    }),
    required: true
  },
  dateStart: {
    type: Date,
    required: true,
    default: Date.now
  },
  courseFee: {
    type: Number,
    min: 0
  }
})

const Enrollment = model('enrollment', enrollmentSchema);

function validateEnrollment(enrollment) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    courseId: Joi.string().required()
  })

  return schema.validate(enrollment);
}

module.exports = { Enrollment, validateEnrollment };