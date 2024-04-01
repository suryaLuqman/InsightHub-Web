const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');

router.get('/', profileController.getProfilePage);

module.exports = router;
