const express = require('express');
const router = express.Router();
const { saveArtikel, reportArtikel, rateArtikel,verifyToken } = require('../controller/artikelAction.controller');


// Menyimpan artikel
router.post('/save/:artikelId', verifyToken, saveArtikel);

// Melaporkan artikel
router.post('/report/:artikelId',verifyToken, reportArtikel);

// Memberikan rating pada artikel
router.post('/rate/:artikelId',verifyToken,rateArtikel);

module.exports = router;