const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');

router.get('/profile/:segment/:id', profileController.getProfilePage);
router.get('/change-password', profileController.getChangePasswordPage);

module.exports = router;
