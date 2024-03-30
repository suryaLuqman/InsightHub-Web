const express = require('express');
const app = express();
const contohRoute = require('./routes/contohRoute');

// Mengatur EJS sebagai view engine
app.set('view engine', 'ejs');

// Menggunakan middleware untuk mengatur rute
app.use('/contoh', contohRoute);

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
