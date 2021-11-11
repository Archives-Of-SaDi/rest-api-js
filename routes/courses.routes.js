const { Router } = require('express');
const { Course, validateCourse } = require('../models/Course.model');
const { Category } = require('../models/Category.model');
const router = Router();

router.get('/', async (req, res) => {
  const courses = await Course.find();
  res.send(courses);
})

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).send('Kurs topilmadi');
  res.send(course);
})

router.post('/', async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(404).send('Kategoriya topilmadi');

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
  res.send(course);
})

router.put('/:id', async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(404).send('Kategoriya topilmadi');

  const course = await Course.findByIdAndUpdate(req.params.id, {
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

  if (!course) return res.status(404).send('Kurs topilmadi');

  res.send(course);
})

router.delete('/:id', async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).send('Kurs topilmadi');
  res.send(course);
})

module.exports = router;