const express = require('express');
const router = express.Router();
const artikelActionController = require('../controller/artikelAction.controller');


// Routes for article actions
router.post('/rating', artikelActionController.addRatingToArtikel);
router.post('/report', artikelActionController.reportArtikel);
router.post('/save', artikelActionController.saveArtikel);

module.exports = router;