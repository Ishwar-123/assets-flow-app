const Asset = require('../models/Asset');

const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({}).populate('category').populate('currentHolderUser', 'name').populate('currentHolderDepartment', 'name');
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssets, registerAsset };
