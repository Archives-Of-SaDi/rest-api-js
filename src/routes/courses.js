const { Types: { ObjectId: { isValid } } } = require('mongoose');
const { Router } = require('express');
const { StatusCodes } = require('http-status-codes')
const { Course, validateCourse } = require('../models/course');
const { Category } = require('../models/category');

const router = Router();

router.get('/', async (req, res) => {
  const courses = await Course.find();
  res.status(StatusCodes.OK).send(courses);
})

router.get('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(StatusCodes.NOT_FOUND).send('Course not found');
  res.status(StatusCodes.OK).send(course);
})

router.post('/', async (req, res) => {
  if (!isValid(req.body.categoryId)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');

  const { error } = validateCourse(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let course = new Course({
    title: req.body.title,
    category: {
      _id: category._id,
      name: category.name
    },
    trainer: req.body.trainer,
    tags: req.body.tags,
    status: req.body.status,
    fee: req.body.fee
  })

  course = await course.save();

  res.status(StatusCodes.OK).send(course);
})

router.put('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');

  if (!isValid(req.body.categoryId)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');

  const { error } = validateCourse(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let course = await Course.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    category: {
      _id: category._id,
      name: category.name
    },
    trainer: req.body.trainer,
    tags: req.body.tags,
    status: req.body.status,
    fee: req.body.fee
  }, { new: true });
  if (!course) return res.status(StatusCodes.NOT_FOUND).send('Course not found');

  res.status(StatusCodes.OK).send(course)
})

router.delete('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  let course = await Course.findByIdAndRemove(req.params.id);
  if (!course) return res.status(StatusCodes.NOT_FOUND).send('Course not found');
  res.status(StatusCodes.OK).send(course);
})

module.exports = router;