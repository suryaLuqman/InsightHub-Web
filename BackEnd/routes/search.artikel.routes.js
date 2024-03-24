const express = require('express');
const router = express.Router();
const searchArtikel = require('../controller/search.artikel.controller');

// Define the search route
router.get('/search', searchArtikel.searchArtikel);

module.exports = router;