const {
  Types: {
    ObjectId: { isValid },
  },
} = require('mongoose');
const { Router } = require('express');
const { StatusCodes } = require('http-status-codes');
const { Enrollment, validateEnrollment } = require('../models/enrollment');
const { Course } = require('../models/course');
const { Customer } = require('../models/customer');
const { auth } = require('../middlewares/auth');
const { admin } = require('../middlewares/admin');

const router = Router();

router.get('/', async (req, res) => {
  const enrollment = await Enrollment.find();
  res.status(StatusCodes.OK).send(enrollment);
});

router.get('/:id', async (req, res) => {
  if (!isValid(req.params.id))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment)
    return res.status(StatusCodes.NOT_FOUND).send('Enrollment not found');
  res.status(StatusCodes.OK).send(enrollment);
});

router.post('/', auth, async (req, res) => {
  if (!isValid(req.body.customerId))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const customer = await Customer.findById(req.body.customerId);
  if (!customer)
    return res.status(StatusCodes.NOT_FOUND).send('Customer not found');

  if (!isValid(req.body.courseId))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const course = await Course.findById(req.body.courseId);
  if (!course)
    return res.status(StatusCodes.NOT_FOUND).send('Course not found');

  const { error } = validateEnrollment(req.body);
  if (error)
    return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let enrollment = new Enrollment({
    customer: {
      _id: customer._id,
      name: customer.name,
    },
    course: {
      _id: course._id,
      title: course.title,
    },
    courseFee: course.fee,
  });

  enrollment = await enrollment.save();

  if (customer.isVip) enrollment.courseFee = course.fee - 0.2 * course.fee;
  customer.bonusPoints++;
  await customer.save();

  res.status(StatusCodes.OK).send(enrollment);
});

router.put('/:id', auth, async (req, res) => {
  if (!isValid(req.params.id))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');

  if (!isValid(req.body.customerId))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const customer = await Customer.findById(req.body.customerId);
  if (!customer)
    return res.status(StatusCodes.NOT_FOUND).send('Customer not found');

  if (!isValid(req.body.courseId))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const course = await Course.findById(req.body.courseId);
  if (!course)
    return res.status(StatusCodes.NOT_FOUND).send('Course not found');

  const { error } = validateEnrollment(req.body);
  if (error)
    return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let enrollment = await Enrollment.findByIdAndUpdate(
    req.params.id,
    {
      customer: {
        _id: customer._id,
        name: customer.name,
      },
      course: {
        _id: course._id,
        title: course.title,
      },
      courseFee: course.fee,
    },
    { new: true }
  );
  if (!enrollment)
    return res.status(StatusCodes.NOT_FOUND).send('Enrollment not found');

  res.status(StatusCodes.OK).send(course);
});

router.delete('/:id', auth, admin, async (req, res) => {
  if (!isValid(req.params.id))
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  let course = await Enrollment.findByIdAndRemove(req.params.id);
  if (!course)
    return res.status(StatusCodes.NOT_FOUND).send('Course not found');
  res.status(StatusCodes.OK).send(course);
});

module.exports = router;
