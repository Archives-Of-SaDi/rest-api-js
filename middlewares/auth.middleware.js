const { verify } = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Token yo\'q');

  try {
    const decoded = verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).send('Yaroqsiz token');
  }

}

module.exports = { auth };