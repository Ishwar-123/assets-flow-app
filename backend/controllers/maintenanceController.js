const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notify');

const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({})
      .populate('asset')
      .populate('reportedBy', 'name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const raiseRequest = async (req, res) => {
  try {
    const { asset, issueDescription, priority } = req.body;
    
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) return res.status(404).json({ message: 'Asset not found' });

    const maintenanceData = {
      asset,
      reportedBy: req.user.id,
      issueDescription,
      priority,
      status: 'Pending'
    };

    if (req.files && req.files.photoUrl) {
      maintenanceData.photoUrl = `/uploads/${req.files.photoUrl[0].filename}`;
    }

    const maintenance = await Maintenance.create(maintenanceData);

    await logActivity({
      actor: req.user.id,
      action: 'Maintenance Raised',
      details: `Raised maintenance ticket for ${assetDoc.assetTag}`,
      entityType: 'Maintenance',
      entityId: maintenance._id
    });

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Ticket not found' });

    maintenance.status = 'Approved';
    await maintenance.save();

    const assetDoc = await Asset.findById(maintenance.asset);
    if (assetDoc) {
      assetDoc.status = 'Under Maintenance';
      await assetDoc.save();
    }

    await logActivity({
      actor: req.user.id,
      action: 'Maintenance Approved',
      details: `Approved ticket ${maintenance._id}`,
      entityType: 'Maintenance',
      entityId: maintenance._id
    });

    await createNotification({
      recipient: maintenance.reportedBy,
      type: 'MaintenanceApproved',
      message: `Your maintenance request for ${assetDoc?.name} has been approved.`,
      relatedEntity: maintenance._id,
      relatedEntityType: 'Maintenance'
    });

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Ticket not found' });

    maintenance.status = 'Rejected';
    maintenance.rejectionReason = rejectionReason;
    await maintenance.save();

    await logActivity({
      actor: req.user.id,
      action: 'Maintenance Rejected',
      details: `Rejected ticket ${maintenance._id}`,
      entityType: 'Maintenance',
      entityId: maintenance._id
    });

    await createNotification({
      recipient: maintenance.reportedBy,
      type: 'MaintenanceRejected',
      message: `Your maintenance request was rejected: ${rejectionReason}`,
      relatedEntity: maintenance._id,
      relatedEntityType: 'Maintenance'
    });

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTechnician = async (req, res) => {
  try {
    const { assignedTechnician } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Ticket not found' });

    maintenance.status = 'In Progress';
    maintenance.assignedTechnician = assignedTechnician;
    await maintenance.save();

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveRequest = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: 'Ticket not found' });

    maintenance.status = 'Resolved';
    maintenance.resolutionNotes = resolutionNotes;
    await maintenance.save();

    const assetDoc = await Asset.findById(maintenance.asset);
    if (assetDoc) {
      assetDoc.status = 'Available';
      await assetDoc.save();
    }

    await logActivity({
      actor: req.user.id,
      action: 'Maintenance Resolved',
      details: `Resolved ticket ${maintenance._id}`,
      entityType: 'Maintenance',
      entityId: maintenance._id
    });

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMaintenanceRequests, raiseRequest, approveRequest, rejectRequest, assignTechnician, resolveRequest };
