const express = require('express');
const mongoose = require('mongoose');

// Import routes
const rootRouter = require('./routes/root');
const categoriesRouter = require('./routes/categories');

// Constants
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/', rootRouter);
app.use('/api/categories', categoriesRouter);

mongoose.connect('mongodb://localhost/rest-api', () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server has been started on ${PORT} port`));
})