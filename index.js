require('express-async-errors');
const express = require('express');
const { connect } = require('mongoose');
const winston = require('winston');
require('winston-mongodb');
const config = require('config');
const { errorMiddleware } = require('./middlewares/errors.middleware');
const app = express();

app.use(express.json());

app.use('/', require('./routes/root.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/customers', require('./routes/customers.routes'));
app.use('/api/courses', require('./routes/courses.routes'));
app.use('/api/enrollments', require('./routes/enrollments.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use(errorMiddleware)

winston.add(new winston.transports.Console());
winston.add(new winston.transports.File({ filename: 'logs/logs.log', level: 'error' }))
winston.add(new winston.transports.MongoDB({ db: 'mongodb://localhost/rest-api-js-logs', level: 'info' }))

winston.exceptions.handle(new winston.transports.File({ filename: 'logs/logs.log' }));

process.on('unhandledRejection', ex => {
  winston.error('unhandledRejection xatosi\n' + ex.message, ex);
  process.exit(1);
})

if (!config.get('jwtPrivateKey')) {
  winston.error('rest_api muhit o\'zgaruvchisi aniqlanmagan');
  process.exit(1);
}

connect('mongodb://localhost/rest-api-js', { useUnifiedTopology: true })
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => winston.info(`App has been started on ${PORT} port...`));
  })
  .catch(() => winston.error('Can\'t connect'))