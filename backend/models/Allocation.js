const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  allocatedToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allocatedToDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  expectedReturnDate: Date,
  actualReturnDate: Date,
  status: { 
    type: String, 
    enum: ['Requested', 'Approved', 'Active', 'Returned', 'Overdue'],
    default: 'Requested'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);
