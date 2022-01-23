const { Types: { ObjectId: { isValid } } } = require('mongoose');
const { Router } = require('express');
const { StatusCodes } = require('http-status-codes')
const { Category, validateCategory } = require('../models/category');

const router = Router();

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
})

router.get('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');
  res.send(category);
})

router.post('/', async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let category = new Category({
    name: req.body.name
  })

  category = await category.save();

  res.send(category);
})

router.put('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');

  const { error } = validateCategory(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');

  res.send(category)
})

router.delete('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  let category = await Category.findByIdAndRemove(req.params.id);
  if (!category) return res.status(StatusCodes.NOT_FOUND).send('Category not found');
  res.send(category);
})

module.exports = router;