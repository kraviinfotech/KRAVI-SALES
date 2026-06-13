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

// POST /api/sellers -> Create seller user and profile (Admin only - email and password mandatory)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('mobile').trim().notEmpty().withMessage('Mobile is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile, password } = req.body;

    try {
      // Check for existing seller by mobile
      const existingSeller = await Seller.findOne({ mobile });
      if (existingSeller) {
        return res.status(400).json({ message: 'A seller with this mobile number already exists' });
      }

      // Check if user already exists by email or mobile
      const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this mobile number or email already exists' });
      }

      // Create user account with login credentials
      const user = new User({ name, email, mobile, password, role: 'seller' });
      await user.save();

      // Create seller profile linked to user and keep the password for admin view
      const seller = new Seller({ userId: user._id, name, mobile, password, managerId: req.user._id });
      await seller.save();

      res.status(201).json({
        message: 'Seller account created successfully. Share the email and password with the seller.',
        seller: {
          id: seller._id,
          userId: user._id,
          name: seller.name,
          mobile: seller.mobile,
          email: user.email,
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
    // Populate user info (email) so frontend can display contact email
    const sellers = await Seller.find({ managerId: req.user._id }).sort({ name: 1 }).populate('userId', 'email');

    // Return sellers with populated email at top-level for convenience
    const result = sellers.map(s => ({
      _id: s._id,
      userId: s.userId?._id,
      name: s.name,
      mobile: s.mobile,
      email: s.userId?.email || null,
      password: s.password || null,
      createdAt: s.createdAt
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sellers' });
  }
});

// GET /api/sellers/:id -> Get specific seller details (Owner manager only)
router.get('/:id', async (req, res) => {
  try {
    const seller = await Seller.findOne({ _id: req.params.id, managerId: req.user._id }).populate('userId', 'email');
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    
    res.json({
      _id: seller._id,
      name: seller.name,
      mobile: seller.mobile,
      email: seller.userId?.email || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching seller' });
  }
});

// PATCH /api/sellers/:id/password -> Manager can change seller's password (seller must have been created with /api/sellers endpoint)
router.patch(
  '/:id/password',
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword } = req.body;
    try {
      const seller = await Seller.findOne({ _id: req.params.id, managerId: req.user._id });
      if (!seller) return res.status(404).json({ message: 'Seller not found' });

      // All sellers must have been created with email and password via POST /api/sellers
      if (!seller.userId) {
        return res.status(400).json({ message: 'Seller account was not properly created. Please use POST /api/sellers to create seller with email and password.' });
      }

      const user = await User.findById(seller.userId);
      if (!user) {
        return res.status(404).json({ message: 'Seller user account not found' });
      }

      // Update password
      user.password = newPassword; // pre-save hook will hash
      await user.save();

      // Keep the admin-facing seller password in sync when manager updates it
      await Seller.findOneAndUpdate({ userId: user._id }, { password: newPassword }).catch(() => null);
      return res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error updating password' });
    }
  }
);

module.exports = router;
