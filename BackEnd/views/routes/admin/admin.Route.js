const express = require('express');
const router = express.Router();
// const homeController = require('../controller/indexController');
const homeController = require('../../controller/admin/admin.Controller');

router.get('/', homeController.getLoginPage);
router.get('/dashboard', homeController.getDashboardPage);

module.exports = router;
