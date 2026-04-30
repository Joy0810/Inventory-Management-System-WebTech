const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// 1. GET /low-stock
router.get('/low-stock', async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $and: [
          { $lte: ["$quantity", "$reorderLevel"] },
          { $gt: ["$reorderLevel", 0] }
        ]
      }
    }).populate('supplierId', 'name');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 2. GET /
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('supplierId', 'name');
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 3. GET /:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplierId', 'name');
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 4. POST /
router.post('/', async (req, res) => {
  try {
    const { name, sku, category, unitPrice, reorderLevel, supplierId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Product name is required" });
    }
    if (!sku || sku.trim() === '') {
      return res.status(400).json({ error: "SKU is required" });
    }
    if (!/^[A-Z0-9]{1,20}$/.test(sku)) {
      return res.status(400).json({ error: "Invalid SKU format. Use uppercase letters and numbers only, max 20 characters" });
    }
    if (unitPrice === undefined || unitPrice === null || typeof unitPrice !== 'number' || unitPrice <= 0) {
      return res.status(400).json({ error: "Unit price must be a positive number" });
    }
    if (reorderLevel !== undefined && reorderLevel !== null) {
      if (typeof reorderLevel !== 'number' || reorderLevel < 0) {
        return res.status(400).json({ error: "Reorder level must be 0 or a positive number" });
      }
    }

    const newProductData = { name, sku, category, unitPrice };
    if (reorderLevel !== undefined && reorderLevel !== null) newProductData.reorderLevel = reorderLevel;
    if (supplierId) newProductData.supplierId = supplierId;

    const product = new Product(newProductData);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "SKU already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// 5. PUT /:id
router.put('/:id', async (req, res) => {
  try {
    const { name, category, unitPrice, reorderLevel, supplierId } = req.body;

    if (unitPrice !== undefined && unitPrice !== null) {
      if (typeof unitPrice !== 'number' || unitPrice <= 0) {
        return res.status(400).json({ error: "Unit price must be a positive number" });
      }
    }
    if (reorderLevel !== undefined && reorderLevel !== null) {
      if (typeof reorderLevel !== 'number' || reorderLevel < 0) {
        return res.status(400).json({ error: "Reorder level must be 0 or a positive number" });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (reorderLevel !== undefined) updateData.reorderLevel = reorderLevel;
    if (supplierId !== undefined) updateData.supplierId = supplierId;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// 6. DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const existingTransaction = await Transaction.findOne({ productId });
    if (existingTransaction) {
      return res.status(400).json({ error: "Cannot delete product with existing transactions" });
    }

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
