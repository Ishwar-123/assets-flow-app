const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  allocatedToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  allocatedToDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  allocatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allocationDate: {
    type: Date,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Overdue'],
    default: 'Active'
  },
  transferStatus: {
    type: String,
    enum: ['None', 'Requested', 'Approved'],
    default: 'None'
  },
  transferRequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transferToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  returnConditionNotes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);
