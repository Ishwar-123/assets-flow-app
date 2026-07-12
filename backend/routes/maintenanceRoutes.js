const express = require('express');
const router = express.Router();
const { getMaintenanceRequests, raiseRequest, approveRequest, rejectRequest, assignTechnician, resolveRequest } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMaintenanceRequests)
  .post(protect, raiseRequest);

router.route('/:id/approve').put(protect, authorize('Asset Manager', 'Admin'), approveRequest);
router.route('/:id/reject').put(protect, authorize('Asset Manager', 'Admin'), rejectRequest);
router.route('/:id/assign').put(protect, authorize('Asset Manager', 'Admin'), assignTechnician);
router.route('/:id/resolve').put(protect, authorize('Asset Manager', 'Admin'), resolveRequest);

module.exports = router;
