const { Router } = require('express');
const { Category, validateCategory } = require('../models/Category.model');
const router = Router();

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
})

router.get('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).send('Kategoriya topilmadi');
  res.send(category);
})

router.post('/', async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let newCategory = new Category({
    name: req.body.name
  });
  newCategory = await newCategory.save();
  res.send(newCategory);
})

router.put('/:id', async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let category = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

  if (!category) return res.status(404).send('Kategoriya topilmadi');

  res.send(category);
})

router.delete('/:id', async (req, res) => {
  let category = await Category.findByIdAndRemove(req.params.id);
  if (!category) return res.status(404).send('Kategoriya topilmadi');
  res.send(category);
})

module.exports = router;