const express = require('express');
const router = express.Router();
const { getDirectory, updateRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/').get(protect, getDirectory);
router.route('/:id/role').put(protect, authorize('Admin'), updateRole);

module.exports = router;

