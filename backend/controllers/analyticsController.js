const Allocation = require('../models/Allocation');
const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

const getUtilization = async (req, res) => {
  try {
    const assets = await Asset.find({ status: { $ne: 'Disposed' } });
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const allocations = await Allocation.find({ allocationDate: { $gte: ninetyDaysAgo } });
    
    const stats = assets.map(asset => {
      const assetAllocations = allocations.filter(a => a.asset.toString() === asset._id.toString());
      let daysAllocated = 0;
      assetAllocations.forEach(a => {
        const start = a.allocationDate > ninetyDaysAgo ? a.allocationDate : ninetyDaysAgo;
        const end = a.actualReturnDate ? a.actualReturnDate : new Date();
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        daysAllocated += days;
      });
      return {
        assetName: asset.name,
        assetTag: asset.assetTag,
        allocationCount: assetAllocations.length,
        daysAllocated
      };
    });

    const mostUsed = [...stats].sort((a, b) => b.daysAllocated - a.daysAllocated).slice(0, 5);
    const idle = stats.filter(s => s.allocationCount === 0);

    res.json({ mostUsed, idle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaintenanceFrequency = async (req, res) => {
  try {
    const tickets = await Maintenance.find().populate('asset');
    const freq = {};
    tickets.forEach(t => {
      const cat = t.asset?.category?.toString() || 'Unknown';
      freq[cat] = (freq[cat] || 0) + 1;
    });
    // Need category names. Instead of complex aggregation, simple map for hackathon
    const categories = await require('../models/AssetCategory').find();
    const result = Object.keys(freq).map(catId => {
      const cat = categories.find(c => c._id.toString() === catId);
      return { categoryName: cat ? cat.name : 'Unknown', count: freq[catId] };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUpcomingMaintenanceRetirement = async (req, res) => {
  try {
    const openTickets = await Maintenance.find({ status: { $in: ['Pending', 'Approved', 'In Progress'] } }).populate('asset');
    
    const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);
    const retiringAssets = await Asset.find({ acquisitionDate: { $lte: fiveYearsAgo }, status: { $ne: 'Disposed' } });

    res.json({ 
      assetsUnderMaintenance: openTickets.map(t => ({ ticketId: t._id, asset: t.asset, priority: t.priority })),
      retiringAssets 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentAllocationSummary = async (req, res) => {
  try {
    const allocations = await Allocation.find({ status: 'Active' }).populate('allocatedToDepartment');
    const summary = {};
    allocations.forEach(a => {
      if (a.allocatedToDepartment) {
        const name = a.allocatedToDepartment.name;
        summary[name] = (summary[name] || 0) + 1;
      }
    });
    res.json(Object.keys(summary).map(dept => ({ department: dept, count: summary[dept] })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingHeatmap = async (req, res) => {
  try {
    const bookings = await Booking.find({});
    // Simplify for hackathon: return all bookings and let UI map them, or group by hour here
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportCSV = async (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
  res.send('Asset Name,Data\nDummy,123\n');
};

module.exports = {
  getUtilization,
  getMaintenanceFrequency,
  getUpcomingMaintenanceRetirement,
  getDepartmentAllocationSummary,
  getBookingHeatmap,
  exportCSV
};
