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
const updateDepartment = async (req, res) => {
  try {
    const { name, head, parentDepartment, status } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    
    department.name = name || department.name;
    department.head = head !== undefined ? head : department.head;
    department.parentDepartment = parentDepartment !== undefined ? parentDepartment : department.parentDepartment;
    department.status = status || department.status;
    
    await department.save();
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment };
