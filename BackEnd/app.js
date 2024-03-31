require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const homeRoute = require('./views/routes/homeRoute');
const dashboardRoute = require('./views/routes/dashboardRoute');
const morgan = require('morgan');
const { serverError, notFound,handleErrors } = require('./middleware/error.handling');
const PORT = process.env.PORT || 3000;


app.use(morgan('dev'));
app.use(express.json());

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'Views')));


// Set view engine (example using EJS)
app.set('view engine', 'ejs');
app.use(homeRoute);
app.use(dashboardRoute);
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



// Set up session middleware
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(notFound);
app.use(serverError);
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
