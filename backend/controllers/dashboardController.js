const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');

const getDashboardStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const assetsAvailable = await Asset.countDocuments({ status: 'Available' });
    const assetsAllocated = await Asset.countDocuments({ status: 'Allocated' });
    
    // Maintenance today (Pending or In Progress)
    const maintenanceTickets = await Maintenance.countDocuments({ 
      status: { $in: ['Pending', 'In Progress'] } 
    });

    // Active Bookings (Allocations with status Active)
    const activeBookings = await Allocation.countDocuments({ status: 'Active' });

    // Overdue returns
    const today = new Date();
    const overdueReturnsCount = await Allocation.countDocuments({
      status: 'Active',
      expectedReturnDate: { $lt: today }
    });

    const overdueAllocations = await Allocation.find({
      status: 'Active',
      expectedReturnDate: { $lt: today }
    }).populate('asset', 'name assetTag').populate('allocatedToUser', 'name');

    res.json({
      kpis: {
        totalAssets,
        assetsAvailable,
        assetsAllocated,
        maintenanceTickets,
        activeBookings,
        overdueReturnsCount
      },
      overdueReturns: overdueAllocations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
