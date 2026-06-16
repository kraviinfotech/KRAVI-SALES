const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String },
  email: { type: String },
  phone: { type: String },
  plan: { type: String, default: 'Basic' },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['Active', 'Expired', 'Trial', 'Pending'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
