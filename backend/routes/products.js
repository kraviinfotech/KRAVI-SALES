const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

// GET /api/products
router.get('/', authMiddleware, subscriptionMiddleware, async (req, res) => {
  try {
    let managerId;

    if (req.user.role === 'manager') {
      managerId = req.user._id;
    } else {
      const seller = await Seller.findOne({ userId: req.user._id });

      if (!seller) {
        return res.status(404).json({
          message: 'Seller profile not found'
        });
      }

      managerId = seller.managerId;
    }

    const products = await Product.find({ managerId })
      .sort({ name: 1 });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error fetching products'
    });
  }
});

// POST /api/products
router.post('/', authMiddleware, roleMiddleware('manager'), subscriptionMiddleware, async (req, res) => {
  const { name, category, baseRate } = req.body;

  if (!name) {
    return res.status(400).json({
      message: 'Product name is required'
    });
  }

  try {
    const product = new Product({ 
      name, 
      category: category || 'General', 
      baseRate, 
      managerId: req.user._id 
    });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error('Add Product Error:', err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Product already exists'
      });
    }

    res.status(500).json({
      message: 'Error saving product'
    });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, roleMiddleware('manager'), subscriptionMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      managerId: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found or unauthorized'
      });
    }

    res.json({
      message: 'Product deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error deleting product'
    });
  }
});

module.exports = router;
