const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  durationType: { 
    type: String, 
    enum: ['trial', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'],
    required: true 
  },
  durationDays: { type: Number, required: true },
  maxSellers: { type: Number, default: 0 },
  features: [String],
  isActive: { type: Boolean, default: true },
  isTrial: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);