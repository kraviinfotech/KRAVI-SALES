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
    body('mobile').trim().notEmpty().withMessage('Mobile is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile, password } = req.body;

    try {
      // If email or password provided, require both and validate
      if ((email && !password) || (!email && password)) {
        return res.status(400).json({ message: 'Both email and password are required to create a login account' });
      }

      // Check for existing seller by mobile
      const existingSeller = await Seller.findOne({ mobile });
      if (existingSeller) {
        return res.status(400).json({ message: 'A seller with this mobile number already exists' });
      }

      let userId = null;

      if (email && password) {
        // validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ message: 'Valid email is required' });
        }
        if (password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists by email or mobile
        const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
        if (existingUser) {
          return res.status(400).json({ message: 'A user with this mobile number or email already exists' });
        }

        // Create user account
        const user = new User({ name, email, mobile, password, role: 'seller' });
        await user.save();
        userId = user._id;
      }

      // Create seller profile
      const seller = new Seller({ userId, name, mobile });
      await seller.save();

      res.status(201).json({
        message: 'Seller successfully created',
        seller: { id: seller._id, userId: userId, name: seller.name, mobile: seller.mobile, createdAt: seller.createdAt }
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
    const sellers = await Seller.find().sort({ name: 1 }).populate('userId', 'email');

    // Return sellers with populated email at top-level for convenience
    const result = sellers.map(s => ({
      _id: s._id,
      userId: s.userId?._id,
      name: s.name,
      mobile: s.mobile,
      email: s.userId?.email || null,
      createdAt: s.createdAt
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching sellers' });
  }
});

// PATCH /api/sellers/:id/password -> Manager can change seller's password
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
      const seller = await Seller.findById(req.params.id);
      if (!seller) return res.status(404).json({ message: 'Seller not found' });

        let user = null;
        if (seller.userId) {
          user = await User.findById(seller.userId);
        }

        // If user exists, update password
        if (user) {
          user.password = newPassword; // pre-save hook will hash
          await user.save();
          return res.json({ message: 'Password updated successfully' });
        }

        // No user linked to this seller. Allow creating one when manager provides an email alongside newPassword.
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: 'Seller has no linked account. Provide email to create login along with the new password.' });
        }

        // validate email and password
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ message: 'Valid email is required' });
        }

        // ensure email not already used
        const existingUser = await User.findOne({ $or: [{ email }, { mobile: seller.mobile }] });
        if (existingUser) {
          return res.status(400).json({ message: 'A user with this email or mobile already exists' });
        }

        // create user and link to seller
        const newUser = new User({ name: seller.name, email, mobile: seller.mobile, password: newPassword, role: 'seller' });
        await newUser.save();
        seller.userId = newUser._id;
        await seller.save();
        return res.json({ message: 'Login created and password set successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error updating password' });
    }
  }
);

module.exports = router;
