const { Types: { ObjectId: { isValid } } } = require('mongoose');
const { Router } = require('express');
const { StatusCodes } = require('http-status-codes')
const { Customer, validateCustomer } = require('../models/customer');

const router = Router();

router.get('/', async (req, res) => {
  const customers = await Customer.find();
  res.send(customers);
})

router.get('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(StatusCodes.NOT_FOUND).send('Customer not found');
  res.status(StatusCodes.OK).send(customer);
})

router.post('/', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    isVip: req.body.isVip,
    phone: req.body.phone
  })

  customer = await customer.save();

  res.status(StatusCodes.CREATED).send(customer);
})

router.put('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');

  const { error } = validateCustomer(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let customer = await Customer.findByIdAndUpdate(req.params.id,
    {
      name: req.body.name,
      isVip: req.body.isVip,
      phone: req.body.phone
    },
    { new: true });
  if (!customer) return res.status(StatusCodes.NOT_FOUND).send('Customer not found');

  res.send(customer);
})

router.delete('/:id', async (req, res) => {
  if (!isValid(req.params.id)) return res.status(StatusCodes.BAD_REQUEST).send('Invalid id');
  let customer = await Customer.findByIdAndRemove(req.params.id);
  if (!customer) return res.status(StatusCodes.NOT_FOUND).send('Customer not found');
  res.send(customer);
})

module.exports = router;