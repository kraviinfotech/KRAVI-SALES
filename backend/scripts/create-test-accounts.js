require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Creating/updating test accounts...\n');
  
  const testPassword = 'Test@1234';
  const hashedPassword = bcrypt.hashSync(testPassword, 10);
  
  // Update or create test manager
  const manager = await User.findOneAndUpdate(
    { email: 'testmanager@gmail.com' },
    {
      email: 'testmanager@gmail.com',
      name: 'Test Manager',
      mobile: '9999999901',
      role: 'manager',
      password: hashedPassword,
      subscription: 'trial'
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Manager account: testmanager@gmail.com (ID: ${manager._id})`);
  
  // Update or create test seller
  const seller = await User.findOneAndUpdate(
    { email: 'testseller@gmail.com' },
    {
      email: 'testseller@gmail.com',
      name: 'Test Seller',
      mobile: '9999999902',
      role: 'seller',
      password: hashedPassword,
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Seller account: testseller@gmail.com (ID: ${seller._id})`);
  
  // Create seller-manager relationship
  const Seller = require('./models/Seller');
  await Seller.findOneAndUpdate(
    { userId: seller._id },
    {
      userId: seller._id,
      managerId: manager._id,
      businessName: 'Test Business',
      address: 'Test Address'
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Seller linked to manager`);
  
  console.log(`\nTest credentials:`);
  console.log(`  Manager: testmanager@gmail.com / ${testPassword}`);
  console.log(`  Seller: testseller@gmail.com / ${testPassword}`);
  
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
