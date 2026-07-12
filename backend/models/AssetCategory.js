const mongoose = require('mongoose');

const assetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  customFields: [{
    fieldName: String,
    fieldType: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
