const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/products -> कोई भी लॉगिन यूजर (Seller/Manager) देख सकता है
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// POST /api/products -> सिर्फ Manager नए प्रोडक्ट ऐड कर सकता है
router.post('/', authMiddleware, roleMiddleware('manager'), async (req, res) => {
  const { name, category, baseRate } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  try {
    const product = new Product({ name, category, baseRate });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Add Product Error:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'Product already exists' });
    res.status(500).json({ message: 'Error saving product' });
  }
});

// DELETE /api/products/:id -> सिर्फ Manager डिलीट कर सकता है
router.delete('/:id', authMiddleware, roleMiddleware('manager'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;