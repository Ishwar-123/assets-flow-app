const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const Booking = require('../models/Booking');

const getDashboardStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const assetsAvailable = await Asset.countDocuments({ status: 'Available' });
    const assetsAllocated = await Asset.countDocuments({ status: 'Allocated' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maintenanceTickets = await Maintenance.countDocuments({ 
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const activeBookings = await Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } });

    const pendingTransfers = await Allocation.countDocuments({ transferStatus: 'Requested' });

    const overdueReturnsCount = await Allocation.countDocuments({
      status: { $in: ['Active', 'Overdue'] },
      expectedReturnDate: { $lt: today }
    });

    const overdueReturns = await Allocation.find({
      status: { $in: ['Active', 'Overdue'] },
      expectedReturnDate: { $lt: today }
    }).populate('asset', 'name assetTag').populate('allocatedToUser', 'name');

    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);
    const upcomingReturns = await Allocation.find({
      status: 'Active',
      expectedReturnDate: { $gte: today, $lte: next7Days }
    }).populate('asset', 'name assetTag').populate('allocatedToUser', 'name');

    res.json({
      kpis: {
        totalAssets,
        assetsAvailable,
        assetsAllocated,
        maintenanceTickets,
        activeBookings,
        pendingTransfers,
        overdueReturnsCount
      },
      overdueReturns,
      upcomingReturns
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
