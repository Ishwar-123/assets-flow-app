const express = require('express');
const router = express.Router();
const { getAllocations, allocateAsset, returnAsset, requestTransfer, approveTransfer, rejectTransfer } = require('../controllers/allocationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAllocations)
  .post(protect, authorize('Asset Manager', 'Admin'), allocateAsset);

router.route('/:id/return').put(protect, returnAsset);
router.route('/:id/transfer-request').post(protect, requestTransfer);
router.route('/:id/transfer-approve').put(protect, authorize('Asset Manager', 'Department Head', 'Admin'), approveTransfer);
router.route('/:id/transfer-reject').put(protect, authorize('Asset Manager', 'Department Head', 'Admin'), rejectTransfer);

module.exports = router;
