const User = require('../models/User');

const getDirectory = async (req, res) => {
  try {
    const users = await User.find({}).populate('department', 'name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = role || user.role;
      const updatedUser = await user.save();
      res.json({ _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDirectory, updateRole };
