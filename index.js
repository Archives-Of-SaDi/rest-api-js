const express = require('express');
const { connect } = require('mongoose');
const app = express();

app.use(express.json());

app.use('/', require('./routes/root.routes'));
app.use('/api/categoires', require('./routes/categories.routes'));

connect('mongodb://localhost/rest-api-js')
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`App has been started on ${PORT} port...`));
  })
  .catch(() => console.log('Can\'t connect'))