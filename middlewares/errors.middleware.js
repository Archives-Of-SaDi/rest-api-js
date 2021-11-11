const winston = require('winston');

function errorMiddleware(err, req, res, next) {
  winston.error(err.message, err);
  res.status(500).send('Server error');
}

module.exports = { errorMiddleware };