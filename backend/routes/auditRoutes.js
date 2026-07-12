const express = require('express');
const router = express.Router();
const { getAudits, createAudit, verifyAssetInAudit, getDiscrepancyReport, closeAuditCycle } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAudits)
  .post(protect, authorize('Admin', 'Asset Manager'), createAudit);

router.route('/:id/verify-item').put(protect, verifyAssetInAudit);
router.route('/:id/discrepancies').get(protect, getDiscrepancyReport);
router.route('/:id/close').put(protect, authorize('Admin', 'Asset Manager'), closeAuditCycle);

module.exports = router;
