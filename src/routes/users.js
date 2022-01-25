const { Router } = require('express');
const { StatusCodes } = require('http-status-codes');
const { User, validateUser } = require('../models/user');
const { genSalt, hash } = require('bcrypt');
const { pick } = require('lodash');
const { auth } = require('../middlewares/auth');

const router = Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.status(StatusCodes.OK).send(user);
})

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(StatusCodes.BAD_REQUEST).send('User is already exists');

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin
  })

  const salt = await genSalt();
  user.password = await hash(user.password, salt);

  user = await user.save();

  res.status(StatusCodes.CREATED).send(pick(user, ['_id', 'name', 'email', 'isAdmin']));
})

module.exports = router;