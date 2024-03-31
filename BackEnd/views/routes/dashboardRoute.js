const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboardController');

// Define route for dashboard
router.get('/dashboard/:segment', DashboardController.dashboard);

module.exports = router;
