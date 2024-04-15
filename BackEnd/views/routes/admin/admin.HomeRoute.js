const express = require('express');
const router = express.Router();
// const homeController = require('../controller/indexController');
const homeController = require('../../controller/admin/admin.IndexController');

router.get('/', homeController.getIndexPage);

module.exports = router;
