const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboardController');

// Define route for dashboard
router.get('/dashboard/:first_name/:id', DashboardController.dashboard);

module.exports = router;
