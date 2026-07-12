const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/assetCategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('Admin'), createCategory);

router.route('/:id')
  .put(protect, authorize('Admin'), updateCategory)
  .delete(protect, authorize('Admin'), deleteCategory);

module.exports = router;

