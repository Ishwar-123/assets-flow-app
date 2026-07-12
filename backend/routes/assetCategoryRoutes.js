const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/assetCategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('Admin'), createCategory);

module.exports = router;

