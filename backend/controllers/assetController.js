const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const Booking = require('../models/Booking');
const { logActivity } = require('../utils/activityLogger');
const QRCode = require('qrcode');

const getAssets = async (req, res) => {
  try {
    const { search, category, status, department, location } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetTag: { $regex: search, $options: 'i' } },
        { qrCode: { $regex: search, $options: 'i' } } // Hackathon scope: search can match qrcode string
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (department) query.department = department;
    if (location) query.location = { $regex: location, $options: 'i' };

    const assets = await Asset.find(query)
      .populate('category')
      .populate('currentHolderUser', 'name')
      .populate('currentHolderDepartment', 'name')
      .populate('department', 'name');
      
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerAsset = async (req, res) => {
  try {
    const assetData = req.body;
    
    // Auto-generate assetTag
    const lastAsset = await Asset.findOne().sort({ assetTag: -1 });
    let nextNum = 1;
    if (lastAsset && lastAsset.assetTag && lastAsset.assetTag.startsWith('AF-')) {
      const lastNum = parseInt(lastAsset.assetTag.replace('AF-', ''), 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    assetData.assetTag = `AF-${nextNum.toString().padStart(4, '0')}`;

    try {
      assetData.qrCode = await QRCode.toDataURL(assetData.assetTag);
    } catch (err) {
      console.error('QR code generation failed', err);
    }

    if (req.files) {
      if (req.files.photoUrl) assetData.photoUrl = `/uploads/${req.files.photoUrl[0].filename}`;
      if (req.files.documents) assetData.documents = req.files.documents.map(f => `/uploads/${f.filename}`);
    }

    const asset = await Asset.create(assetData);

    await logActivity({
      actor: req.user.id,
      action: 'Asset Registered',
      details: `Registered new asset ${asset.assetTag}`,
      entityType: 'Asset',
      entityId: asset._id
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssetHistory = async (req, res) => {
  try {
    const assetId = req.params.id;
    const allocations = await Allocation.find({ asset: assetId })
      .populate('allocatedToUser', 'name')
      .populate('allocatedBy', 'name');
    const maintenance = await Maintenance.find({ asset: assetId })
      .populate('reportedBy', 'name');
    const bookings = await Booking.find({ resource: assetId })
      .populate('bookedBy', 'name');

    const history = [
      ...allocations.map(a => ({ type: 'Allocation', date: a.allocationDate, details: a })),
      ...maintenance.map(m => ({ type: 'Maintenance', date: m.createdAt, details: m })),
      ...bookings.map(b => ({ type: 'Booking', date: b.createdAt, details: b }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssets, registerAsset, getAssetHistory };
