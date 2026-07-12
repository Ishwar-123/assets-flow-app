const express = require('express');
const router = express.Router();
const { getMaintenanceRequests, raiseRequest } = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMaintenanceRequests)
  .post(protect, raiseRequest);

module.exports = router;

