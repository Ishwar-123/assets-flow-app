const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');

const getAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find({}).populate('asset').populate('allocatedToUser', 'name').populate('allocatedToDepartment', 'name');
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const allocateAsset = async (req, res) => {
  try {
    const { assetId, allocatedToUser, allocatedToDepartment, expectedReturnDate } = req.body;
    
    // Check if asset is available
    const asset = await Asset.findById(assetId);
    if (!asset || asset.status !== 'Available') {
      return res.status(400).json({ message: 'Asset is not available for allocation' });
    }

    const allocation = await Allocation.create({
      asset: assetId,
      allocatedToUser,
      allocatedToDepartment,
      expectedReturnDate,
      status: 'Active'
    });

    // Update asset status
    asset.status = 'Allocated';
    asset.currentHolderUser = allocatedToUser;
    asset.currentHolderDepartment = allocatedToDepartment;
    await asset.save();

    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllocations, allocateAsset };
