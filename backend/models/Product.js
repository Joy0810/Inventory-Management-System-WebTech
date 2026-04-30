const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20,
    match: [/^[A-Z0-9]+$/, 'SKU must be uppercase alphanumeric only']
  },
  category: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
