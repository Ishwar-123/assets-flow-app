const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');

const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({}).populate('asset').populate('raisedBy', 'name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const raiseRequest = async (req, res) => {
  try {
    const { assetId, issueDescription, priority } = req.body;
    const maintenance = await Maintenance.create({
      asset: assetId,
      raisedBy: req.user.id,
      issueDescription,
      priority
    });
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMaintenanceRequests, raiseRequest };
