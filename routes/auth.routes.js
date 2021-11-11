const { Router } = require('express');
const Joi = require('joi');
const { compare } = require('bcrypt');
const { User } = require('../models/user.models');
const { auth } = require('../middlewares/auth.middleware');
const router = Router();

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Email yoki parol noto\'g\'ri');

  const isValidPassword = await compare(req.body.password, user.password);
  if (!isValidPassword) return res.status(400).send('Email yoki parol noto\'g\'ri');

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(isValidPassword);
})

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  })

  return schema.validate(user);
}

module.exports = router;