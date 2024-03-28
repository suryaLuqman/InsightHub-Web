require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { serverError, notFound,handleErrors } = require('./middleware/error.handling');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1', require('./routes/index.routes'));
app.use((req, res, next) => {
  // res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500{link web yang diizinkan}');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});
app.use(notFound);
app.use(serverError);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

