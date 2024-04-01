require('dotenv').config();
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const prisma = require('../BackEnd/libs/prisma');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const homeRoute = require('./views/routes/homeRoute');
const dashboardRoute = require('./views/routes/dashboardRoute');
const profileRoute = require('./views/routes/profileRoute');
const morgan = require('morgan');
const { serverError, notFound,handleErrors } = require('./middleware/error.handling');
const PORT = process.env.PORT || 3000;


app.use(morgan('dev'));
app.use(express.json());

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'Views')));

// Set up session middleware
// Konfigurasi untuk menyimpan sesi di PostgreSQL
app.use(session({
  store: new PgSession({
    prismaClient: prisma,
    tableName: 'Session', // Nama tabel sesi di database Anda
    schemaName: 'public', // Nama skema database Anda
  }),
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 1 hari dalam milidetik 
  }
}));



// Set view engine (example using EJS)
app.set('view engine', 'ejs');
app.use(homeRoute);
app.use(dashboardRoute);
app.use(profileRoute);

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
