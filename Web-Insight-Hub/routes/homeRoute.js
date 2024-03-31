const express = require('express');
const router = express.Router();
const homeController = require('../app/controllers/indexController');

router.get('/', homeController.getIndexPage);

module.exports = router;
