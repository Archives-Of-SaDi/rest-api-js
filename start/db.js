const { connect } = require('mongoose');
const { info } = require('winston');

module.exports = function (app) {
  connect('mongodb://localhost/rest-api-js', { useUnifiedTopology: true })
    .then(() => {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => info(`App has been started on ${PORT} port...`));
    })
}