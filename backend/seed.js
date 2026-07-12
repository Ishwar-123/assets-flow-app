const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load models
const User = require('./models/User');
const Department = require('./models/Department');
const AssetCategory = require('./models/AssetCategory');
const Asset = require('./models/Asset');
const Allocation = require('./models/Allocation');
const Maintenance = require('./models/Maintenance');
const Booking = require('./models/Booking');
const Audit = require('./models/Audit');
const ActivityLog = require('./models/ActivityLog');
const Notification = require('./models/Notification');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/assetflow');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      AssetCategory.deleteMany(),
      Asset.deleteMany(),
      Allocation.deleteMany(),
      Maintenance.deleteMany(),
      Booking.deleteMany(),
      Audit.deleteMany(),
      ActivityLog.deleteMany(),
      Notification.deleteMany()
    ]);
    console.log('Database cleared.');

    // --- 1. Departments ---
    console.log('Creating departments...');
    const itDept = await Department.create({ name: 'Information Technology', location: 'Building A, Floor 3' });
    const hrDept = await Department.create({ name: 'Human Resources', location: 'Building B, Floor 1' });
    const engDept = await Department.create({ name: 'Engineering', location: 'Building A, Floor 4' });
    const salesDept = await Department.create({ name: 'Sales & Marketing', location: 'Building C, Floor 2' });

    // --- 2. Users ---
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({ name: 'System Admin', email: 'admin@assetflow.com', password, role: 'Admin', department: itDept._id });
    
    // Dept Heads
    const itHead = await User.create({ name: 'Sarah Connor', email: 'sarah.c@assetflow.com', password, role: 'Department Head', department: itDept._id });
    const hrHead = await User.create({ name: 'Michael Scott', email: 'michael.s@assetflow.com', password, role: 'Department Head', department: hrDept._id });
    const engHead = await User.create({ name: 'Tony Stark', email: 'tony.s@assetflow.com', password, role: 'Department Head', department: engDept._id });
    
    // Asset Manager
    const assetManager = await User.create({ name: 'Dwight Schrute', email: 'dwight.s@assetflow.com', password, role: 'Asset Manager', department: itDept._id });

    // Employees
    const emp1 = await User.create({ name: 'Jim Halpert', email: 'jim.h@assetflow.com', password, role: 'Employee', department: salesDept._id });
    const emp2 = await User.create({ name: 'Pam Beesly', email: 'pam.b@assetflow.com', password, role: 'Employee', department: hrDept._id });
    const emp3 = await User.create({ name: 'Peter Parker', email: 'peter.p@assetflow.com', password, role: 'Employee', department: engDept._id });
    const emp4 = await User.create({ name: 'Bruce Banner', email: 'bruce.b@assetflow.com', password, role: 'Employee', department: engDept._id });
    const emp5 = await User.create({ name: 'Clark Kent', email: 'clark.k@assetflow.com', password, role: 'Employee', department: itDept._id });

    // Update Departments with Heads
    await Department.findByIdAndUpdate(itDept._id, { headOfDepartment: itHead._id });
    await Department.findByIdAndUpdate(hrDept._id, { headOfDepartment: hrHead._id });
    await Department.findByIdAndUpdate(engDept._id, { headOfDepartment: engHead._id });

    // --- 3. Asset Categories ---
    console.log('Creating asset categories...');
    const laptopCat = await AssetCategory.create({
      name: 'Laptops',
      description: 'Company issued laptops for employees',
      customFields: [
        { fieldName: 'RAM', fieldType: 'text', isRequired: true },
        { fieldName: 'Storage', fieldType: 'text', isRequired: true },
        { fieldName: 'Processor', fieldType: 'text', isRequired: true }
      ]
    });

    const monitorCat = await AssetCategory.create({
      name: 'Monitors',
      description: 'External displays',
      customFields: [
        { fieldName: 'Resolution', fieldType: 'text', isRequired: true },
        { fieldName: 'Size', fieldType: 'number', isRequired: true }
      ]
    });

    const vehicleCat = await AssetCategory.create({
      name: 'Vehicles',
      description: 'Company fleet vehicles',
      customFields: [
        { fieldName: 'License Plate', fieldType: 'text', isRequired: true },
        { fieldName: 'Mileage', fieldType: 'number', isRequired: false },
        { fieldName: 'Next Service Date', fieldType: 'date', isRequired: false }
      ]
    });

    const roomCat = await AssetCategory.create({
      name: 'Meeting Rooms',
      description: 'Bookable spaces',
      customFields: [
        { fieldName: 'Capacity', fieldType: 'number', isRequired: true },
        { fieldName: 'Has Projector', fieldType: 'text', isRequired: false }
      ]
    });

    // --- 4. Assets ---
    console.log('Creating assets...');
    
    // Laptops
    const laptop1 = await Asset.create({
      name: 'MacBook Pro M3 Max - 16"',
      assetTag: 'AF-1001',
      category: laptopCat._id,
      department: engDept._id,
      location: 'Building A',
      status: 'Allocated',
      acquisitionDate: new Date('2024-01-15'),
      cost: 3499,
      customFieldsData: { RAM: '64GB', Storage: '2TB SSD', Processor: 'Apple M3 Max' }
    });

    const laptop2 = await Asset.create({
      name: 'MacBook Pro M2 Pro - 14"',
      assetTag: 'AF-1002',
      category: laptopCat._id,
      department: engDept._id,
      location: 'Building A',
      status: 'Allocated',
      acquisitionDate: new Date('2023-06-10'),
      cost: 2499,
      customFieldsData: { RAM: '32GB', Storage: '1TB SSD', Processor: 'Apple M2 Pro' }
    });

    const laptop3 = await Asset.create({
      name: 'Dell XPS 15',
      assetTag: 'AF-1003',
      category: laptopCat._id,
      department: salesDept._id,
      location: 'Building C',
      status: 'Allocated',
      acquisitionDate: new Date('2023-11-20'),
      cost: 1899,
      customFieldsData: { RAM: '32GB', Storage: '1TB SSD', Processor: 'Intel Core i9' }
    });

    const laptop4 = await Asset.create({
      name: 'Lenovo ThinkPad X1 Carbon',
      assetTag: 'AF-1004',
      category: laptopCat._id,
      department: hrDept._id,
      location: 'Building B',
      status: 'Allocated',
      acquisitionDate: new Date('2022-05-15'),
      cost: 1699,
      customFieldsData: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel Core i7' }
    });

    const laptop5 = await Asset.create({
      name: 'MacBook Air M2',
      assetTag: 'AF-1005',
      category: laptopCat._id,
      department: itDept._id,
      location: 'Building A',
      status: 'Available',
      acquisitionDate: new Date('2024-03-01'),
      cost: 1299,
      customFieldsData: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Apple M2' }
    });

    const laptop6 = await Asset.create({
      name: 'Dell Latitude 7420',
      assetTag: 'AF-1006',
      category: laptopCat._id,
      department: itDept._id,
      location: 'IT Storage',
      status: 'Under Maintenance',
      acquisitionDate: new Date('2021-08-10'),
      cost: 1400,
      customFieldsData: { RAM: '16GB', Storage: '512GB SSD', Processor: 'Intel Core i5' }
    });

    // Monitors
    const monitor1 = await Asset.create({
      name: 'LG UltraFine 5K',
      assetTag: 'AF-2001',
      category: monitorCat._id,
      department: engDept._id,
      location: 'Building A',
      status: 'Allocated',
      acquisitionDate: new Date('2023-01-10'),
      cost: 1299,
      customFieldsData: { Resolution: '5120x2880', Size: 27 }
    });

    const monitor2 = await Asset.create({
      name: 'Dell UltraSharp 4K',
      assetTag: 'AF-2002',
      category: monitorCat._id,
      department: salesDept._id,
      location: 'Building C',
      status: 'Allocated',
      acquisitionDate: new Date('2022-11-05'),
      cost: 799,
      customFieldsData: { Resolution: '3840x2160', Size: 32 }
    });

    const monitor3 = await Asset.create({
      name: 'ASUS ProArt Display',
      assetTag: 'AF-2003',
      category: monitorCat._id,
      department: itDept._id,
      location: 'IT Storage',
      status: 'Available',
      acquisitionDate: new Date('2024-02-15'),
      cost: 999,
      customFieldsData: { Resolution: '2560x1440', Size: 27 }
    });

    // Vehicles
    const vehicle1 = await Asset.create({
      name: 'Tesla Model 3 - Company Car',
      assetTag: 'AF-3001',
      category: vehicleCat._id,
      department: salesDept._id,
      location: 'Parking Lot A',
      status: 'Available',
      acquisitionDate: new Date('2023-05-20'),
      cost: 45000,
      customFieldsData: { 'License Plate': 'XYZ-1234', Mileage: 12500, 'Next Service Date': '2024-11-20' }
    });

    const vehicle2 = await Asset.create({
      name: 'Ford Transit Van',
      assetTag: 'AF-3002',
      category: vehicleCat._id,
      department: itDept._id,
      location: 'Loading Dock',
      status: 'Allocated',
      acquisitionDate: new Date('2021-02-10'),
      cost: 35000,
      customFieldsData: { 'License Plate': 'VAN-9876', Mileage: 45000, 'Next Service Date': '2024-08-15' }
    });

    // Rooms
    const room1 = await Asset.create({
      name: 'Boardroom Alpha',
      assetTag: 'AF-4001',
      category: roomCat._id,
      department: hrDept._id,
      location: 'Building B',
      status: 'Available',
      acquisitionDate: new Date('2020-01-01'),
      cost: 0,
      customFieldsData: { Capacity: 20, 'Has Projector': 'Yes' }
    });

    const room2 = await Asset.create({
      name: 'Huddle Room 1',
      assetTag: 'AF-4002',
      category: roomCat._id,
      department: engDept._id,
      location: 'Building A',
      status: 'Available',
      acquisitionDate: new Date('2020-01-01'),
      cost: 0,
      customFieldsData: { Capacity: 4, 'Has Projector': 'No' }
    });

    // --- 5. Allocations ---
    console.log('Creating allocations...');
    
    // Active Allocations
    const alloc1 = await Allocation.create({
      asset: laptop1._id,
      allocatedToUser: engHead._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    });

    const alloc2 = await Allocation.create({
      asset: laptop2._id,
      allocatedToUser: emp3._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    });

    const alloc3 = await Allocation.create({
      asset: laptop3._id,
      allocatedToUser: emp1._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    const alloc4 = await Allocation.create({
      asset: laptop4._id,
      allocatedToUser: emp2._id,
      allocatedBy: adminUser._id,
      status: 'Overdue',
      expectedReturnDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Overdue by 5 days
    });

    const alloc5 = await Allocation.create({
      asset: monitor1._id,
      allocatedToUser: engHead._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    const alloc6 = await Allocation.create({
      asset: monitor2._id,
      allocatedToUser: emp1._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    const alloc7 = await Allocation.create({
      asset: vehicle2._id,
      allocatedToUser: emp5._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Upcoming return
    });

    // Returned Allocation
    const alloc8 = await Allocation.create({
      asset: laptop6._id,
      allocatedToUser: emp4._id,
      allocatedBy: adminUser._id,
      status: 'Returned',
      expectedReturnDate: new Date('2024-05-01'),
      actualReturnDate: new Date('2024-04-28'),
      returnConditionNotes: 'Screen flickering occasionally.'
    });

    // Transfer Request
    const alloc9 = await Allocation.create({
      asset: monitor2._id, // Jim Halpert currently has it
      allocatedToUser: emp1._id,
      allocatedBy: adminUser._id,
      status: 'Active',
      expectedReturnDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      transferStatus: 'Requested',
      transferToUser: emp4._id // Transferring to Bruce Banner
    });

    // --- 6. Maintenance Tickets ---
    console.log('Creating maintenance tickets...');
    await Maintenance.create({
      asset: laptop6._id,
      raisedBy: emp4._id,
      issueDescription: 'Screen flickers when rendering heavy graphics.',
      priority: 'High',
      status: 'In Progress',
      assignedTechnician: 'Clark Kent'
    });

    await Maintenance.create({
      asset: laptop4._id,
      raisedBy: emp2._id,
      issueDescription: 'Battery dies very quickly, doesn\'t hold charge.',
      priority: 'Medium',
      status: 'Pending'
    });

    await Maintenance.create({
      asset: vehicle2._id,
      raisedBy: emp5._id,
      issueDescription: 'Check engine light came on during delivery run.',
      priority: 'Critical',
      status: 'Resolved',
      resolutionNotes: 'Replaced oxygen sensor. Cleared codes.',
      assignedTechnician: 'Auto Shop Pro'
    });

    // --- 7. Bookings ---
    console.log('Creating bookings...');
    const now = new Date();
    
    // Ongoing booking
    await Booking.create({
      resource: room1._id,
      bookedBy: hrHead._id,
      startTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Started 1 hour ago
      endTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // Ends in 1 hour
      purpose: 'Q2 Performance Reviews',
      status: 'Ongoing'
    });

    // Upcoming booking
    await Booking.create({
      resource: vehicle1._id,
      bookedBy: emp1._id,
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Starts in 2 days
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Ends in 3 days
      purpose: 'Client visit to regional office',
      status: 'Upcoming'
    });

    // Completed booking
    await Booking.create({
      resource: room2._id,
      bookedBy: engHead._id,
      startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      endTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hour meeting
      purpose: 'Sprint Planning',
      status: 'Completed'
    });

    // --- 8. Audits ---
    console.log('Creating audits...');
    const audit1 = await Audit.create({
      name: 'Q3 2024 IT Hardware Audit',
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // Ends in 10 days
      auditors: [assetManager._id, adminUser._id],
      status: 'In Progress',
      scopeDepartment: itDept._id
    });

    const audit2 = await Audit.create({
      name: '2023 Annual Fleet Review',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-15'),
      auditors: [assetManager._id],
      status: 'Closed'
    });

    // --- 9. Notifications ---
    console.log('Creating notifications...');
    await Notification.create({
      recipient: adminUser._id,
      type: 'TransferApproved',
      message: 'Transfer of Dell UltraSharp 4K to Bruce Banner has been approved.',
      relatedEntity: alloc9._id,
      relatedEntityType: 'Allocation',
      isRead: false
    });

    await Notification.create({
      recipient: adminUser._id,
      type: 'AssetAssigned',
      message: 'New MacBook Pro assigned to your department.',
      isRead: false
    });

    await Notification.create({
      recipient: adminUser._id,
      type: 'OverdueReturnAlert',
      message: 'Lenovo ThinkPad X1 Carbon is overdue for return.',
      isRead: true
    });

    // --- 10. Activity Logs ---
    console.log('Creating activity logs...');
    await ActivityLog.create({
      action: 'Created Asset',
      actor: adminUser._id,
      entityType: 'Asset',
      entityId: laptop1._id,
      details: 'Registered new MacBook Pro M3 Max - 16"'
    });

    await ActivityLog.create({
      action: 'Allocated Asset',
      actor: adminUser._id,
      entityType: 'Allocation',
      entityId: alloc1._id,
      details: 'Allocated MacBook Pro M3 Max - 16" to Tony Stark'
    });

    await ActivityLog.create({
      action: 'Raised Maintenance',
      actor: emp4._id,
      entityType: 'Maintenance',
      details: 'Reported screen flickering issue on Dell Latitude 7420'
    });
    
    await ActivityLog.create({
      action: 'Booked Resource',
      actor: emp1._id,
      entityType: 'Booking',
      details: 'Booked Tesla Model 3 - Company Car for upcoming client visit'
    });

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(() => {
  seedData();
});
