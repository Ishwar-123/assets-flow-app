const Audit = require('../models/Audit');
const Asset = require('../models/Asset');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notify');

const getAudits = async (req, res) => {
  try {
    const audits = await Audit.find({})
      .populate('auditors', 'name')
      .populate('scopeDepartment', 'name')
      .populate('discrepancies.asset', 'name assetTag category location');
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAudit = async (req, res) => {
  try {
    const { name, startDate, endDate, scopeDepartment, scopeLocation, auditors } = req.body;
    
    let assetQuery = { status: { $ne: 'Disposed' } };
    if (scopeDepartment) assetQuery.currentHolderDepartment = scopeDepartment;
    if (scopeLocation) assetQuery.location = scopeLocation;

    const assetsInScope = await Asset.find(assetQuery);
    const discrepancies = assetsInScope.map(asset => ({
      asset: asset._id,
      verifiedStatus: 'Pending'
    }));

    const audit = await Audit.create({
      name,
      startDate,
      endDate,
      scopeDepartment,
      scopeLocation,
      auditors,
      discrepancies,
      status: 'Scheduled'
    });

    await logActivity({
      actor: req.user.id,
      action: 'Audit Created',
      details: `Created audit cycle ${name} targeting ${discrepancies.length} assets`,
      entityType: 'Audit',
      entityId: audit._id
    });

    res.status(201).json(audit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyAssetInAudit = async (req, res) => {
  try {
    const { assetId, verifiedStatus, notes } = req.body;
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    if (!audit.auditors.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not an auditor for this cycle' });
    }

    const discrepancy = audit.discrepancies.find(d => d.asset.toString() === assetId);
    if (!discrepancy) return res.status(404).json({ message: 'Asset not in audit scope' });

    discrepancy.verifiedStatus = verifiedStatus;
    discrepancy.notes = notes;
    discrepancy.verifiedBy = req.user.id;
    discrepancy.verifiedAt = Date.now();

    await audit.save();
    res.json(audit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDiscrepancyReport = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id).populate('discrepancies.asset');
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    const report = audit.discrepancies.filter(d => ['Missing', 'Damaged'].includes(d.verifiedStatus));
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closeAuditCycle = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    const pendingItems = audit.discrepancies.filter(d => d.verifiedStatus === 'Pending');
    if (pendingItems.length > 0) {
      return res.status(400).json({ message: `Cannot close audit: ${pendingItems.length} items still pending verification` });
    }

    audit.status = 'Closed';
    await audit.save();

    let lostCount = 0;
    let damagedCount = 0;

    for (let discrepancy of audit.discrepancies) {
      if (discrepancy.verifiedStatus === 'Missing') {
        await Asset.findByIdAndUpdate(discrepancy.asset, { status: 'Lost' });
        lostCount++;
      } else if (discrepancy.verifiedStatus === 'Damaged') {
        await Asset.findByIdAndUpdate(discrepancy.asset, { condition: 'Damaged' });
        damagedCount++;
      }
    }

    await logActivity({
      actor: req.user.id,
      action: 'Audit Closed',
      details: `Closed audit ${audit.name}. ${lostCount} lost, ${damagedCount} damaged.`,
      entityType: 'Audit',
      entityId: audit._id
    });

    if (lostCount > 0 || damagedCount > 0) {
      const admins = await require('../models/User').find({ role: 'Admin' });
      for (let admin of admins) {
        await createNotification({
          recipient: admin._id,
          type: 'AuditDiscrepancyFlagged',
          message: `Audit ${audit.name} closed with ${lostCount} lost and ${damagedCount} damaged items.`,
          relatedEntity: audit._id,
          relatedEntityType: 'Audit'
        });
      }
    }

    res.json(audit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAudits, createAudit, verifyAssetInAudit, getDiscrepancyReport, closeAuditCycle };
