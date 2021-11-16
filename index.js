const express = require('express');
const { info } = require('winston');
const app = express();

require('./start/logging')(app);
require('./start/routes')(app);
require('./start/db')();
require('./start/config')();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`App has been started on ${PORT} port...`))
module.exports = server;