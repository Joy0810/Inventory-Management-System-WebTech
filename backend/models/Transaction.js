const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['stock-in', 'stock-out']
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtTransaction: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
