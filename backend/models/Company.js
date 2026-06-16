const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String },
  email: { type: String },
  phone: { type: String },
  logo: { type: String },
  gstNumber: { type: String },
  address: { type: String },
  plan: { type: String, default: 'Basic' },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  managerCount: { type: Number, default: 0 },
  subscriptionDetails: {
    users: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    storage: { type: String, default: '0 GB' },
    features: [{ type: String }]
  },
  status: { type: String, enum: ['Active', 'Expired', 'Trial', 'Pending'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
