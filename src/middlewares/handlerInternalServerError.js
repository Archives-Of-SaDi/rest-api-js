const { StatusCodes } = require('http-status-codes');
const winston = require('winston');

function handlerInternalServerError(err, req, res, next) {
  winston.error(err.message, err);
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send('Internal Server Error :(');
}

module.exports = { handlerInternalServerError };
