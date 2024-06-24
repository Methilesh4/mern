const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/items', require('./routes/items'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/bar-chart', require('./routes/barchart'));
app.use('/api/pie-chart', require('./routes/piechart'));
app.use('/api/combined-api', require('./routes/combineddata'));
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
