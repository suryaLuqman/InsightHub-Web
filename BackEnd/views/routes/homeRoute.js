const express = require('express');
const router = express.Router();
const homeController = require('../controller/indexController');

router.get('/', homeController.getIndexPage);

module.exports = router;
