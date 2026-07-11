require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('\n=== All Users ===');
  const users = await User.find({}, { _id: 1, email: 1, name: 1, role: 1 }).limit(10);
  users.forEach(u => console.log(`${u._id} | ${u.role} | ${u.email} | ${u.name}`));
  
  console.log('\n=== Managers ===');
  const managers = await User.find({ role: 'manager' }, { _id: 1, email: 1, name: 1 }).limit(5);
  managers.forEach(m => console.log(`${m._id} | ${m.email} | ${m.name}`));
  
  console.log('\n=== Sellers ===');
  const sellers = await User.find({ role: 'seller' }, { _id: 1, email: 1, name: 1 }).limit(5);
  sellers.forEach(s => console.log(`${s._id} | ${s.email} | ${s.name}`));
  
  process.exit(0);
}).catch(e => {
  console.error('DB error:', e.message);
  process.exit(1);
});
