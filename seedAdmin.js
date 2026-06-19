const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salestracker';
    await mongoose.connect(mongoUri);
    
    const adminData = {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      mobile: '9999999999',
      password: 'adminpass@123', // Will be hashed by pre-save hook
      role: 'admin'
    };

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const admin = new User(adminData);
    await admin.save();
    
    console.log('Successfully created initial Super Admin account.');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();