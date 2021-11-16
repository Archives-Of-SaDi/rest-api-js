const { connect } = require('mongoose');
const { debug } = require('winston');
const config = require('config');

module.exports = function () {
  connect(config.get('db'), { useUnifiedTopology: true })
    .then(() => {
      debug('Connected to mongodb');
    })
}