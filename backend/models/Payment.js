const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  provider: { type: String, enum: ['razorpay', 'stripe', 'cashfree'], required: true },
  transactionId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  failureReason: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  invoiceUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
