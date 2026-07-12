const express = require('express');
const router = express.Router();
const { getUtilization, getMaintenanceFrequency, getUpcomingMaintenanceRetirement, getDepartmentAllocationSummary, getBookingHeatmap, exportCSV } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/utilization').get(protect, getUtilization);
router.route('/maintenance-frequency').get(protect, getMaintenanceFrequency);
router.route('/upcoming-maintenance-retirement').get(protect, getUpcomingMaintenanceRetirement);
router.route('/department-allocation-summary').get(protect, getDepartmentAllocationSummary);
router.route('/booking-heatmap').get(protect, getBookingHeatmap);
router.route('/export').get(protect, exportCSV);

module.exports = router;
