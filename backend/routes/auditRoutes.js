const express = require('express');
const router = express.Router();
const { getAudits, createAudit } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAudits)
  .post(protect, authorize('Admin', 'Asset Manager'), createAudit);

module.exports = router;

