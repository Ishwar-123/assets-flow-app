const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  scopeDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  scopeLocation: {
    type: String
  },
  auditors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Closed'],
    default: 'Scheduled'
  },
  discrepancies: [{
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset'
    },
    verifiedStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Missing', 'Damaged'],
      default: 'Pending'
    },
    notes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);
