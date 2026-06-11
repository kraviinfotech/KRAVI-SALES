const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes in this file for managers only
router.use(authMiddleware, roleMiddleware('manager'));

// POST /api/sellers -> Create seller user and profile
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('mobile').trim().notEmpty().withMessage('Mobile is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, mobile, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this mobile number already exists' });
      }

      // Create user
      const user = new User({
        name,
        mobile,
        password,
        role: 'seller'
      });
      await user.save();

      // Create seller profile
      const seller = new Seller({
        userId: user._id,
        name,
        mobile
      });

      try {
        await seller.save();
      } catch (saveErr) {
        // Rollback user creation if profile creation fails
        await User.findByIdAndDelete(user._id);
        throw saveErr;
      }

      res.status(201).json({
        message: 'Seller successfully created',
        seller: {
          id: seller._id,
          userId: user._id,
          name: seller.name,
          mobile: seller.mobile,
          createdAt: seller.createdAt
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error creating seller' });
    }
  }
);

// GET /api/sellers -> List all sellers
router.get('/', async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ name: 1 });
    res.json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sellers' });
  }
});

module.exports = router;
