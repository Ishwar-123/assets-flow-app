const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
  assetTag: { type: String, required: true, unique: true },
  serialNumber: String,
  acquisitionDate: Date,
  acquisitionCost: Number,
  condition: String,
  location: String,
  isSharedBookable: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'], 
    default: 'Available' 
  },
  currentHolderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentHolderDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
