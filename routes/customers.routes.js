const { Router } = require('express');
const { Types: { ObjectId: { isValid } } } = require('mongoose');
const { Customer, validateCustomer } = require('../models/customer.model');
const { auth } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/isAdmin.middleware');
const router = Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find();
  res.send(customers);
})

router.get('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(404).send('Yaroqsiz id');
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send('Mijoz topilmadi');
  res.send(customer);
})

router.post('/', auth, async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    isVip: req.body.isVip,
    phone: req.body.phone,
    bonusPoints: 0
  });

  customer = await customer.save();
  res.send(customer);
})

router.put('/:id', auth, async (req, res) => {
  if (!isValid(req.params.id)) return res.status(404).send('Yaroqsiz id');
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      isVip: req.body.isVip,
      phone: req.body.phone
    },
    { new: true });

  if (!customer) return res.status(404).send('Mijoz topilmadi!');
  res.send(customer);
})

router.delete('/:id', [auth, isAdmin], async (req, res) => {
  if (!isValid(req.params.id)) return res.status(404).send('Yaroqsiz id');
  const customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer) return res.status(404).send('Mijoz topilmadi')
  res.send(customer);
})

module.exports = router;