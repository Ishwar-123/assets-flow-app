const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['AssetAssigned', 'MaintenanceApproved', 'MaintenanceRejected', 'BookingConfirmed', 'BookingCancelled', 'BookingReminder', 'TransferApproved', 'OverdueReturnAlert', 'AuditDiscrepancyFlagged'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedEntityType: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
