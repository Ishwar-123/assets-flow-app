const express = require('express');
const router = express.Router();
const { getAssets, registerAsset } = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAssets)
  .post(protect, authorize('Asset Manager', 'Admin'), registerAsset);

module.exports = router;

