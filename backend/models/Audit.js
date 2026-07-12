const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  auditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  discrepancies: [{
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    verifiedStatus: { type: String, enum: ['Verified', 'Missing', 'Damaged'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);
