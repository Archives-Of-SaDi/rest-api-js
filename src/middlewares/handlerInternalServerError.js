const { StatusCodes } = require('http-status-codes');

function handlerInternalServerError(err, req, res, next) {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error :(');
}

module.exports = { handlerInternalServerError };