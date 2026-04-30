const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const { name, contactEmail, phone, address } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Supplier name is required" });
    }

    const supplier = new Supplier({ name, contactEmail, phone, address });
    await supplier.save();
    
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, contactEmail, phone, address } = req.body;
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contactEmail, phone, address },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    const linkedProduct = await Product.findOne({ supplierId });
    if (linkedProduct) {
      return res.status(400).json({ error: "Cannot delete supplier with linked products" });
    }

    const supplier = await Supplier.findByIdAndDelete(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
