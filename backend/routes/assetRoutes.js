const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAssets, registerAsset, getAssetHistory } = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.route('/')
  .get(protect, getAssets)
  .post(protect, authorize('Asset Manager', 'Admin'), upload.fields([{ name: 'photoUrl', maxCount: 1 }, { name: 'documents', maxCount: 5 }]), registerAsset);

router.route('/:id/history').get(protect, getAssetHistory);

module.exports = router;
