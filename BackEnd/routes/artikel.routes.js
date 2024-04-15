const express = require('express');
const router = express.Router();
const { createArtikel,getAllArtikel, updateArtikel,deleteArtikel, checkLogoutStatus }=require('../controller/artikel.controller');
const {authenticateUser}=require('../controller/auth.controllers');
const { image } = require ('../libs/multer');


// Route untuk membuat artikel baru
router.post('/upload', image.single('gambar_artikel'),authenticateUser,checkLogoutStatus,createArtikel );

// Route untuk mendapatkan semua artikel
router.get('/get-all', getAllArtikel);

// Route untuk memperbarui artikel berdasarkan Artikel ID
router.put('/updateArtikel/:artikelId',image.single('gambar_artikel'),authenticateUser,checkLogoutStatus, updateArtikel);

// Route untuk menghapus artikel berdasarkan ID
router.delete('/deleteArtikel/:artikelId', authenticateUser,checkLogoutStatus,deleteArtikel);

module.exports = router;
