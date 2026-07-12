const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/assetflow')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const adminExists = await User.findOne({ email: 'admin@assetflow.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'System Admin',
        email: 'admin@assetflow.com',
        password: hashedPassword,
        role: 'Admin'
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
