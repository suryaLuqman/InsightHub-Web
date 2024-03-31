const express = require('express');
const app = express();
const contohRoute = require('./routes/contohRoute');
const homeRoute = require('./routes/homeRoute');
const path = require('path'); // Menambahkan baris ini untuk mengimpor modul path


// Atur direktori views
app.set('views', path.join(__dirname, 'app', 'views'));

// Menyajikan berkas statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Atur engine view yang digunakan (contoh menggunakan EJS)
app.set('view engine', 'ejs');

// Menggunakan middleware untuk mengatur rute
app.use(homeRoute);
app.use('/contoh', contohRoute);

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
