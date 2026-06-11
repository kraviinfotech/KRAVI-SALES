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
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Seller.deleteMany({});
    await SalesRecord.deleteMany({});
    await SaleItem.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Create default Manager
    const manager = new User({
      name: 'Admin Manager',
      mobile: '9876543210',
      password: 'manager123',
      role: 'manager'
    });
    await manager.save();
    console.log('Default Manager created: name="Admin Manager", mobile="9876543210", password="manager123"');

    // 2. Create default Seller user
    const sellerUser = new User({
      name: 'John Seller',
      mobile: '9876543211',
      password: 'seller123',
      role: 'seller'
    });
    await sellerUser.save();

    // Create seller profile
    const seller = new Seller({
      userId: sellerUser._id,
      name: 'John Seller',
      mobile: '9876543211'
    });
    await seller.save();
    console.log('Default Seller created: name="John Seller", mobile="9876543211", password="seller123"');

    // 3. Create another seller for comparative performance charts
    const sellerUser2 = new User({
      name: 'Sarah Seller',
      mobile: '9876543212',
      password: 'seller123',
      role: 'seller'
    });
    await sellerUser2.save();

    const seller2 = new Seller({
      userId: sellerUser2._id,
      name: 'Sarah Seller',
      mobile: '9876543212'
    });
    await seller2.save();
    console.log('Second Seller created: name="Sarah Seller", mobile="9876543212", password="seller123"');

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
