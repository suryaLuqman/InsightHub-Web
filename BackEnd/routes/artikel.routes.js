const express = require('express');
const router = express.Router();
const artikelController = require('../controller/artikel.controller');

// Route untuk membuat artikel baru
router.post('/add', artikelController.createArtikel);

// Route untuk mendapatkan semua artikel
router.get('/get-all', artikelController.getAllArtikel);

// Route untuk memperbarui artikel berdasarkan ID
router.put('/edit/:id', artikelController.updateArtikel);

// Route untuk menghapus artikel berdasarkan ID
router.delete('/delete/:id', artikelController.deleteArtikel);

module.exports = router;
