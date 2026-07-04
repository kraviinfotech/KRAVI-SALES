const mongoose = require('mongoose');
const Plan = require('./models/Plan');
require('dotenv').config();

const seedPlans = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/salestracker';
    await mongoose.connect(mongoUri);

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    const newPlans = [
      {
        name: 'Free',
        description: 'Try the manager dashboard and basic seller workflow before upgrading.',
        price: 0,
        durationDays: 14,
        maxSellers: 1,
        features: [],
        isTrial: true,
        isActive: true,
        displayOrder: 1
      },
      {
        name: '1 Month',
        description: 'Short term plan for your business needs.',
        price: 299,
        durationMonths: 1,
        durationDays: 30,
        maxSellers: 5,
        features: [],
        isActive: true,
        displayOrder: 2
      },
      {
        name: '3 Months',
        description: 'Quarterly plan to manage a growing sales team.',
        price: 799,
        durationMonths: 3,
        durationDays: 90,
        maxSellers: 12,
        features: [],
        isActive: true,
        displayOrder: 3
      },
      {
        name: '1 Year',
        description: 'Best value for long term business operations.',
        price: 2999,
        durationMonths: 12,
        durationDays: 365,
        maxSellers: 20,
        features: [],
        isActive: true,
        displayOrder: 4
      }
    ];

    await Promise.all(newPlans.map((p) => new Plan(p).save()));

    console.log('Successfully seeded 4 plans.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding plans:', err);
    process.exit(1);
  }
};

seedPlans();
