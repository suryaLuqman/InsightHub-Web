const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');

router.get('/profile/:segment/:id', profileController.getProfilePage);

module.exports = router;
