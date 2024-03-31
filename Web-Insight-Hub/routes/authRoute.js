const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router;
