const config = require('config');
const { StatusCodes } = require('http-status-codes');
const { verify } = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(StatusCodes.UNAUTHORIZED).send('No token');

  try {
    const decoded = verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid token');
  }
}

module.exports = { auth };
