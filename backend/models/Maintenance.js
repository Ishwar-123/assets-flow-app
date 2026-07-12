const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueDescription: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  assignedTechnician: String,
  resolutionNotes: { type: String },
  rejectionReason: { type: String },
  photoUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
