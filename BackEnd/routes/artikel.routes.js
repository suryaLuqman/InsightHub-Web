const express = require('express');
const router = express.Router();
const { createArtikel,getAllArtikel, updateArtikel,deleteArtikel, authenticate }=require('../controller/artikel.controller');
const { image } = require ('../libs/multer');


// Route untuk membuat artikel baru
router.post('/upload', image.single('gambar_artikel'),authenticate,createArtikel );

// Route untuk mendapatkan semua artikel
router.get('/get-all', getAllArtikel);

// Route untuk memperbarui artikel berdasarkan ID
// router.put('/updateArtikel/:id',authenticate, updateArtikel);

// Route untuk menghapus artikel berdasarkan ID
router.delete('/delete/:id', deleteArtikel);

module.exports = router;
