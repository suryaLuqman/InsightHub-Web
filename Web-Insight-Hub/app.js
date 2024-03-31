const express = require('express');
const session = require('express-session');
const morgan = require('morgan'); // Import morgan module
const fs = require('fs'); // Import fs module
const path = require('path');
const contohRoute = require('./routes/contohRoute');
const homeRoute = require('./routes/homeRoute');
const authRoute = require('./routes/authRoute');
require('dotenv').config();

const app = express();

// Set views directory
app.set('views', path.join(__dirname, 'app', 'views'));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine (example using EJS)
app.set('view engine', 'ejs');

// Create a write stream for logging to a file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Set up morgan middleware for HTTP request logging
app.use(morgan('combined', {
    stream: accessLogStream, // Log to file
    skip: (req, res) => res.statusCode < 400 // Skip logging successful requests to the file
}));

// Log to console
app.use(morgan('dev'));

// Use middleware to set up routes
app.use('/contoh', contohRoute);
app.use(homeRoute);
app.use('/auth', authRoute);

// Set up session middleware
app.use(session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
