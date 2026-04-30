const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// GET /
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.productId) {
      query.productId = req.query.productId;
    }

    if (req.query.from || req.query.to) {
      query.createdAt = {};
      if (req.query.from) {
        query.createdAt.$gte = new Date(req.query.from + 'T00:00:00.000Z');
      }
      if (req.query.to) {
        query.createdAt.$lte = new Date(req.query.to + 'T23:59:59.999Z');
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .populate('productId', 'name sku');

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /
router.post('/', async (req, res) => {
  try {
    const { productId, type, quantity, note } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    if (type !== 'stock-in' && type !== 'stock-out') {
      return res.status(400).json({ error: "type must be stock-in or stock-out" });
    }
    if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (type === 'stock-out') {
      const updated = await Product.findOneAndUpdate(
        { _id: productId, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true }
      );
      if (!updated) {
        return res.status(400).json({ error: "Insufficient stock", available: product.quantity });
      }
    } else if (type === 'stock-in') {
      await Product.findByIdAndUpdate(productId, { $inc: { quantity: +quantity } });
    }

    const transaction = new Transaction({
      productId,
      type,
      quantity,
      priceAtTransaction: product.unitPrice,
      note: note || ''
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
