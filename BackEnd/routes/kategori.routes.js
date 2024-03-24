const express = require('express');
const router = express.Router();
const kategoriController = require('../controller/kategori.controller');


router.post('/add', kategoriController.createKategori);
router.get('/get-all', kategoriController.getAllKategori);
router.delete('/delete/:id', kategoriController.deleteKategori);


module.exports = router;