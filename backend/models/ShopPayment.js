const mongoose = require('mongoose');

const shopPaymentSchema = new mongoose.Schema({
  salesRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesRecord',
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    enum: ['Cash', 'Online'],
    required: true
  },
  paymentPhoto: {
    type: String,
    default: null
  },
  txnId: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ShopPayment', shopPaymentSchema);
