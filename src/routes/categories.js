const { Types: { ObjectId: { isValid } } } = require('mongoose');
const { Router } = require('express');
const { StatusCodes } = require('http-status-codes');
const { Category, validateCategory } = require('../models/category');
const { auth } = require('../middlewares/auth');
const { admin } = require('../middlewares/admin');

const router = Router();

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.status(StatusCodes.OK).send(categories);
})

router.get('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');
  res.status(StatusCodes.OK).send(category);
})

router.post('/', auth, async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let category = new Category({
    name: req.body.name
  })

  category = await category.save();

  res.status(StatusCodes.CREATED).send(category);
})

router.put('/:id', auth, async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');

  const { error } = validateCategory(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');

  res.status(StatusCodes.OK).send(category);
})

router.delete('/:id', auth, admin, async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  let category = await Category.findByIdAndRemove(req.params.id);
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');
  res.status(StatusCodes.OK).send(category);
})

module.exports = router;