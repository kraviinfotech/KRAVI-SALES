require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Seller = require('./models/Seller');
const SalesRecord = require('./models/SalesRecord');
const SaleItem = require('./models/SaleItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salestracker';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database for seeding (idempotent mode)...');

    // This seed script is now idempotent and safe for real databases.
    // It will only create the initial Super Admin if one does not exist.
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = new User({
      name: 'Super Admin',
      email: adminEmail,
      mobile: '9999999999',
      password: 'adminpass@123',
      role: 'admin'
    });
    await admin.save();
    console.log('Created Super Admin:', adminEmail);

    // 4. Create Mock Sales Records for the last 10 days
    const mockShops = [
      { name: 'Apex Grocery Store', address: '12 Main St', type: 'Retail', landmark: 'Opposite Park' },
      { name: 'Metro Wholesale Mart', address: '45 Industrial Area', type: 'Wholesale', landmark: 'Gate 2' },
      { name: 'City Medical Store', address: '78 Hospital Rd', type: 'Other', landmark: 'Next to Clinic' },
      { name: 'Super Bazaar', address: '101 Center Mall', type: 'Distributor', landmark: 'Ground Floor' },
      { name: 'National Traders', address: '302 Bazaar St', type: 'Wholesale', landmark: 'Near Clock Tower' },
      { name: 'Daily Needs Store', address: '14 Residency Lane', type: 'Retail', landmark: 'Near Subway' },
      { name: 'Wellness Biotech', address: '55 Station Road', type: 'Other', landmark: 'Beside Junction' }
    ];

    const mockProducts = [
      { name: 'Premium Soap Pack', rate: 120 },
      { name: 'Herbal Shampoo 200ml', rate: 180 },
      { name: 'Sunflower Cooking Oil 1L', rate: 150 },
      { name: 'Wheat Flour 5kg', rate: 220 },
      { name: 'Assam Tea Leaves 500g', rate: 130 },
      { name: 'Refined Sugar 1kg', rate: 45 }
    ];

    const sellersList = [seller, seller2];

    for (let dayOffset = 9; dayOffset >= 0; dayOffset--) {
      // Create records on different days
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      
      // Create 1-2 visits per day
      const visitsCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 visits
      
      for (let i = 0; i < visitsCount; i++) {
        const selectedSeller = sellersList[Math.floor(Math.random() * sellersList.length)];
        const shop = mockShops[Math.floor(Math.random() * mockShops.length)];
        
        // Random items list
        const itemsCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
        const selectedProducts = [];
        let totalAmount = 0;

        for (let j = 0; j < itemsCount; j++) {
          const prod = mockProducts[Math.floor(Math.random() * mockProducts.length)];
          const qty = Math.floor(Math.random() * 5) + 1; // 1 to 5 qty
          const amount = qty * prod.rate;
          totalAmount += amount;
          selectedProducts.push({
            productName: prod.name,
            quantity: qty,
            rate: prod.rate,
            amount: amount
          });
        }

        // Set hours randomly for variation
        date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

        const salesRecord = new SalesRecord({
          sellerId: selectedSeller._id,
          managerId: manager._id,
          shopName: `${shop.name}`,
          shopAddress: shop.address,
          landmark: shop.landmark,
          shopType: shop.type,
          latitude: 28.6139 + (Math.random() - 0.5) * 0.1, // Delhi centered coords
          longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
          visitDatetime: new Date(date),
          totalAmount: Number(totalAmount.toFixed(2)) // Ensure totalAmount is a number
        });

        await salesRecord.save();

        for (const item of selectedProducts) {
          const saleItem = new SaleItem({
            recordId: salesRecord._id,
            productName: item.productName,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
          });
          await saleItem.save();
        }
      }
    }

    console.log('Seeded Mock Sales and SaleItems for analytics.');
    console.log('Seeding complete. Exiting.');
    process.exit(0);

  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
