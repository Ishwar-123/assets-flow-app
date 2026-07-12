const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const Booking = require('../models/Booking');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'Admin' || userRole === 'Asset Manager') {
      // Global KPIs
      const totalAssets = await Asset.countDocuments();
      const assetsAvailable = await Asset.countDocuments({ status: 'Available' });
      const assetsAllocated = await Asset.countDocuments({ status: 'Allocated' });
      
      const maintenanceTickets = await Maintenance.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
      const activeBookings = await Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } });
      const pendingTransfers = await Allocation.countDocuments({ transferStatus: 'Requested' });
      
      const overdueReturnsCount = await Allocation.countDocuments({ status: { $in: ['Active', 'Overdue'] }, expectedReturnDate: { $lt: today } });
      const overdueReturns = await Allocation.find({ status: { $in: ['Active', 'Overdue'] }, expectedReturnDate: { $lt: today } }).populate('asset', 'name assetTag').populate('allocatedToUser', 'name');
      const upcomingReturns = await Allocation.find({ status: 'Active', expectedReturnDate: { $gte: today, $lte: next7Days } }).populate('asset', 'name assetTag').populate('allocatedToUser', 'name');

      return res.json({
        roleView: 'Global',
        kpis: { totalAssets, assetsAvailable, assetsAllocated, maintenanceTickets, activeBookings, pendingTransfers, overdueReturnsCount },
        overdueReturns,
        upcomingReturns
      });
    } 
    
    if (userRole === 'Department Head') {
      const userDept = req.user.department;
      
      const deptAllocations = await Allocation.find({ allocatedToDepartment: userDept, status: 'Active' }).populate('asset', 'name assetTag status condition');
      const deptAssetCount = deptAllocations.length;
      
      const pendingTransfers = await Allocation.countDocuments({ 
        $or: [ { allocatedToDepartment: userDept }, { transferToDepartment: userDept } ],
        transferStatus: 'Requested'
      });

      const deptUsers = await require('../models/User').countDocuments({ department: userDept });

      return res.json({
        roleView: 'Department',
        kpis: { deptAssetCount, pendingTransfers, deptUsers },
        myDepartmentAssets: deptAllocations
      });
    }

    // Employee
    const myAllocations = await Allocation.find({ allocatedToUser: userId, status: { $in: ['Active', 'Overdue'] } }).populate('asset', 'name assetTag');
    const myActiveBookings = await Booking.find({ bookedBy: userId, status: { $in: ['Upcoming', 'Ongoing'] } }).populate('resource', 'name');
    const myMaintenance = await Maintenance.find({ reportedBy: userId, status: { $in: ['Pending', 'In Progress'] } }).populate('asset', 'name');

    return res.json({
      roleView: 'Employee',
      kpis: {
        myAllocatedAssets: myAllocations.length,
        myActiveBookings: myActiveBookings.length,
        myOpenTickets: myMaintenance.length
      },
      myAllocations,
      myActiveBookings,
      myMaintenance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
