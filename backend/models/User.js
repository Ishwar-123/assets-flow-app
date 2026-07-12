const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: false },
  role: { type: String, enum: ['Employee', 'Department Head', 'Asset Manager', 'Admin'], default: 'Employee' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
