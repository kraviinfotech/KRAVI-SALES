const mongoose = require('mongoose');

const SalesRecordSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  shopAddress: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  shopType: {
    type: String,
    enum: ['Retail', 'Wholesale', 'Distributor', 'Other'],
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  visitDatetime: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Partial', 'Pending'],
    default: 'Pending'
  },
  scannerPhoto: {
    type: String,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SalesRecord', SalesRecordSchema);
