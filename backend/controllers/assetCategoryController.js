const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset'); // Need this to check for existing assets before deletion

const getCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    const category = await AssetCategory.create({ name, customFields });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, customFields } = req.body;
    const category = await AssetCategory.findByIdAndUpdate(
      req.params.id,
      { name, customFields },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if any active assets are using this category
    const assetCount = await Asset.countDocuments({ category: categoryId });
    if (assetCount > 0) {
      return res.status(400).json({ message: `Cannot delete category. ${assetCount} asset(s) are currently assigned to it.` });
    }

    const category = await AssetCategory.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
