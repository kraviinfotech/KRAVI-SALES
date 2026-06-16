const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  durationMonths: { type: Number, default: 3 },
  managers: { type: String, default: '5' },
  storageGb: { type: Number, default: 2 },
  features: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
