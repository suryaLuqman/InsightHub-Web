const express = require('express');
const router = express.Router();
const contohController = require('../app/controllers/contohController');

router.get('/', contohController.getContohPage);

module.exports = router;
