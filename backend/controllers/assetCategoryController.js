const AssetCategory = require('../models/AssetCategory');

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

module.exports = { getCategories, createCategory };
