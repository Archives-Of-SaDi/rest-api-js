const express = require('express');
const { connect } = require('mongoose');
const config = require('config');
const app = express();

app.use(express.json());

app.use('/', require('./routes/root.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/customers', require('./routes/customers.routes'));
app.use('/api/courses', require('./routes/courses.routes'));
app.use('/api/enrollments', require('./routes/enrollments.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/auth', require('./routes/auth.routes'));

if (!config.get('jwtPrivateKey')) {
  console.log('rest_api muhit o\'zgaruvchisi aniqlanmagan');
  process.exit(1);
}

connect('mongodb://localhost/rest-api-js')
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`App has been started on ${PORT} port...`));
  })
  .catch(() => console.log('Can\'t connect'))