const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesRecord',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    enum: ['quantity', 'weight'],
    default: 'quantity'
  },
  quantity: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    default: null
  },
  price: {
    type: Number,
    default: null
  },
  rate: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});

SaleItemSchema.index({ recordId: 1 });

module.exports = mongoose.model('SaleItem', SaleItemSchema);
