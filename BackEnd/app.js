require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path'); // Diperlukan untuk menangani path file EJS
const app = express();
const socketIO = require('socket.io');
const socketHandler = require('./libs/socketHandler');
const { serverError, notFound } = require('./middleware/error.handling');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Middleware untuk parsing body dari form
app.use('/api/v1', require('./routes/index.routes'));

// Middleware untuk CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use(morgan('dev'));

// Middleware untuk serve file statis (contoh: CSS, JavaScript)
app.use('/resources', express.static(path.join(__dirname, 'views', 'resources')));

// Set view engine dan lokasi folder views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routing untuk halaman utama
app.get('/', (req, res, next) => {
  res.render('index', { name: 'ok', url: 'https://google.com' });
});

app.use(notFound);
app.use(serverError);

// Inisialisasi Socket.io
const io = socketIO(server);
socketHandler.initSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = {
  io,
  app,
};
