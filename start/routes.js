const express = require('express');
const { errorMiddleware } = require('../middlewares/errors.middleware');

module.exports = function (app) {
  app.use(express.json());

  app.use('/', require('../routes/root.routes'));
  app.use('/api/categories', require('../routes/categories.routes'));
  app.use('/api/customers', require('../routes/customers.routes'));
  app.use('/api/courses', require('../routes/courses.routes'));
  app.use('/api/enrollments', require('../routes/enrollments.routes'));
  app.use('/api/users', require('../routes/users.routes'));
  app.use('/api/auth', require('../routes/auth.routes'));
  app.use(errorMiddleware)
}