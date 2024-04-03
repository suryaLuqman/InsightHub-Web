const express = require('express');
const router = express.Router();
const artikelController = require('../controller/artikelController');

// Define route for dashboard
router.get('/:first_name/:id/add-artikel', artikelController.getArtikelPage);
router.get('/:id/:judul', artikelController.getViewArtikelPage);

module.exports = router;
