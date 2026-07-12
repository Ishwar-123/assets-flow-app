const express = require('express');
const router = express.Router();
const { getAllocations, allocateAsset } = require('../controllers/allocationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllocations)
  .post(protect, authorize('Asset Manager', 'Admin'), allocateAsset);

module.exports = router;

