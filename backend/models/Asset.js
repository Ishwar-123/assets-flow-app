const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  assetTag: { type: String, required: true, unique: true },
  serialNumber: { type: String },
  isBookable: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
  description: { type: String },
  acquisitionDate: { type: Date, required: true },
  cost: { type: Number, required: true },
  location: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: { 
    type: String, 
    enum: ['Available', 'Allocated', 'Under Maintenance', 'Disposed', 'Lost'],
    default: 'Available'
  },
  condition: { type: String, enum: ['New', 'Good', 'Fair', 'Poor', 'Damaged'], default: 'Good' },
  currentHolderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentHolderDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  photoUrl: { type: String },
  documents: [{ type: String }],
  qrCode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
