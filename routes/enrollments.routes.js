const { Router } = require('express');
const { Enrollment, validateEnrollment } = require('../models/enrollment.model');
const { Customer } = require('../models/Customer.model');
const { Course } = require('../models/Course.model');
const router = Router();

router.get('/', async (req, res) => {
  const enrollments = await Enrollment.find();
  res.send(enrollments);
})

router.post('/', async (req, res) => {
  const { error } = validateEnrollment(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send('Mijoz topilmadi');

  const course = await Course.findById(req.body.courseId);
  if (!course) return res.status(404).send('Kurs topilmadi');

  let enrollment = new Enrollment({
    customer: {
      _id: customer._id,
      name: customer.name
    },
    course: {
      course: course._id,
      title: course.title
    },
    courseFee: course.fee
  })

  if (customer.isVip) enrollment.courseFee = course.fee - (0.2 * course.fee);

  enrollment = await enrollment.save();

  customer.bonusPoints++;
  customer.save();

  res.send(enrollment);
})

router.get('/:id', async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) return res.status(404).send('Qabul topilmadi');
  res.send(enrollment);
})

module.exports = router;