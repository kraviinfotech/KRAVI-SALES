const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  durationMonths: { type: Number, default: 3 },
  durationDays: { type: Number, default: 0 },
  managers: { type: String, default: '5' },
  maxSellers: { type: Number, default: 0 },
  storageGb: { type: Number, default: 2 },
  features: { type: [String], default: [] },
  isTrial: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
