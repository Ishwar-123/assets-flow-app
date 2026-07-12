const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notify');

const checkOverdueAllocations = async () => {
  const now = new Date();
  await Allocation.updateMany(
    { status: 'Active', expectedReturnDate: { $lt: now } },
    { $set: { status: 'Overdue' } }
  );
};

const getAllocations = async (req, res) => {
  try {
    await checkOverdueAllocations();
    const allocations = await Allocation.find({})
      .populate('asset')
      .populate('allocatedToUser', 'name role')
      .populate('allocatedToDepartment', 'name')
      .populate('transferToUser', 'name')
      .populate('transferRequestedBy', 'name');
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const allocateAsset = async (req, res) => {
  try {
    const { asset, allocatedToUser, allocatedToDepartment, expectedReturnDate } = req.body;
    
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) return res.status(404).json({ message: 'Asset not found' });
    
    if (assetDoc.status !== 'Available') {
      const currentAllocation = await Allocation.findOne({ asset, status: { $in: ['Active', 'Overdue'] } }).populate('allocatedToUser', 'name');
      if (currentAllocation) {
        const holderName = currentAllocation.allocatedToUser ? currentAllocation.allocatedToUser.name : 'someone';
        return res.status(400).json({ 
          message: `currently held by ${holderName}`, 
          currentAllocationId: currentAllocation._id,
          canRequestTransfer: true 
        });
      }
      return res.status(400).json({ message: 'Asset is not available for allocation' });
    }

    const allocation = await Allocation.create({
      asset,
      allocatedToUser,
      allocatedToDepartment,
      allocatedBy: req.user.id,
      expectedReturnDate,
      status: 'Active'
    });

    assetDoc.status = 'Allocated';
    assetDoc.currentHolderUser = allocatedToUser;
    assetDoc.currentHolderDepartment = allocatedToDepartment;
    await assetDoc.save();

    await logActivity({
      actor: req.user.id,
      action: 'Asset Allocated',
      details: `Allocated asset ${assetDoc.assetTag} to user ${allocatedToUser}`,
      entityType: 'Allocation',
      entityId: allocation._id
    });

    if (allocatedToUser) {
      await createNotification({
        recipient: allocatedToUser,
        type: 'AssetAssigned',
        message: `You have been assigned asset: ${assetDoc.name}`,
        relatedEntity: allocation._id,
        relatedEntityType: 'Allocation'
      });
    }

    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const returnAsset = async (req, res) => {
  try {
    const { conditionNotes } = req.body;
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ message: 'Allocation not found' });

    allocation.status = 'Returned';
    allocation.actualReturnDate = Date.now();
    allocation.returnConditionNotes = conditionNotes;
    await allocation.save();

    const assetDoc = await Asset.findById(allocation.asset);
    if (assetDoc) {
      assetDoc.status = 'Available';
      assetDoc.currentHolderUser = null;
      assetDoc.currentHolderDepartment = null;
      await assetDoc.save();
    }

    await logActivity({
      actor: req.user.id,
      action: 'Asset Returned',
      details: `Asset ${assetDoc?.assetTag} was returned`,
      entityType: 'Allocation',
      entityId: allocation._id
    });

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestTransfer = async (req, res) => {
  try {
    const { transferToUser } = req.body;
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation || !['Active', 'Overdue'].includes(allocation.status)) {
      return res.status(400).json({ message: 'Invalid allocation for transfer' });
    }

    allocation.transferStatus = 'Requested';
    allocation.transferRequestedBy = req.user.id;
    allocation.transferToUser = transferToUser;
    await allocation.save();

    await logActivity({
      actor: req.user.id,
      action: 'Transfer Requested',
      details: `Requested transfer for allocation ${allocation._id}`,
      entityType: 'Allocation',
      entityId: allocation._id
    });

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveTransfer = async (req, res) => {
  try {
    const oldAllocation = await Allocation.findById(req.params.id);
    if (!oldAllocation || oldAllocation.transferStatus !== 'Requested') {
      return res.status(400).json({ message: 'Invalid transfer request' });
    }

    oldAllocation.status = 'Returned';
    oldAllocation.actualReturnDate = Date.now();
    oldAllocation.transferStatus = 'Approved';
    await oldAllocation.save();

    const newAllocation = await Allocation.create({
      asset: oldAllocation.asset,
      allocatedToUser: oldAllocation.transferToUser,
      allocatedBy: req.user.id,
      status: 'Active'
    });

    const assetDoc = await Asset.findById(oldAllocation.asset);
    if (assetDoc) {
      assetDoc.currentHolderUser = oldAllocation.transferToUser;
      await assetDoc.save();
    }

    await logActivity({
      actor: req.user.id,
      action: 'Transfer Approved',
      details: `Transfer approved. New holder: ${oldAllocation.transferToUser}`,
      entityType: 'Allocation',
      entityId: newAllocation._id
    });

    await createNotification({
      recipient: oldAllocation.transferToUser,
      type: 'TransferApproved',
      message: `A transfer was approved. You now hold asset: ${assetDoc?.name}`,
      relatedEntity: newAllocation._id,
      relatedEntityType: 'Allocation'
    });

    res.json(newAllocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectTransfer = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndUpdate(
      req.params.id,
      { transferStatus: 'None', transferRequestedBy: null, transferToUser: null },
      { new: true }
    );
    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllocations, allocateAsset, returnAsset, requestTransfer, approveTransfer, rejectTransfer };
