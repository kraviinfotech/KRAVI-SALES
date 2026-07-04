require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salestracker').then(async () => {
  const users = await User.find().sort({ _id: -1 }).limit(3);
  if (users.length > 0) {
    await Promise.all(users.map(async (u) => {
      u.role = 'manager';
      await u.save();
      console.log('Promoted user: ' + (u.email || u.mobile) + ' to manager!');
    }));
  } else {
    console.log('No users found.');
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
