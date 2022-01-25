const { StatusCodes } = require('http-status-codes');

function admin(req, res, next) {
  const isAdmin = req.user.isAdmin;

  if (!isAdmin) return res.status(StatusCodes.FORBIDDEN).send('User is not admin');
  next();
}

module.exports = { admin };