const express = require('express');
const router = express.Router();
const artikelController = require('../controller/artikelController');

// Define route for dashboard
router.get('/search-artikel/search', artikelController.searchArtikel);

router.get('/:id/:judul', artikelController.getViewArtikelPage);

router.get('/:first_name/:id/add-artikel', artikelController.getArtikelPage);

router.post('/:first_name/:id/add-artikel', artikelController.createArtikel);

module.exports = router;
