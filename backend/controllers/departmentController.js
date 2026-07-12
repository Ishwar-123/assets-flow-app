const Department = require('../models/Department');

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).populate('head', 'name');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, head, parentDepartment, status } = req.body;
    const department = await Department.create({ name, head, parentDepartment, status });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDepartments, createDepartment };
