const { Router } = require('express');
const { User, validateUser } = require('../models/user.models');
const router = Router();

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isUser = await User.findOne({ email: req.body.email });
  if (isUser) return res.status(400).send('Mavjud bo\'lgan foydalanuvchi');

  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  })

  user = user.save();

  res.send(user);
})

module.exports = router;