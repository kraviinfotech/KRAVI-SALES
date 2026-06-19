const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  provider: { type: String, enum: ['razorpay', 'stripe', 'cashfree'], required: true },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  metadata: { type: Map, of: String },
  invoiceUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);