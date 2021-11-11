const express = require('express');
const app = express();

require('./start/logging')(app);
require('./start/routes')(app);
require('./start/db')(app);
require('./start/config')();