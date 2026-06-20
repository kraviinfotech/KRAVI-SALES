const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');

// In-memory OTP store: key=email, value={ otp, expiresAt, formData }
const otpStore = new Map();

// Protect all routes in this file for managers only
router.use(authMiddleware, roleMiddleware('manager'), subscriptionMiddleware);

// POST /api/sellers/send-otp -> Validate fields, generate OTP, return for dev preview
router.post(
  '/send-otp',
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
      // Check seller limit before sending OTP
      const sellerLimit = Number(req.subscription?.planId?.maxSellers || req.subscription?.planId?.managers || 0);
      if (sellerLimit > 0) {
        const sellerCount = await Seller.countDocuments({ managerId: req.user._id });
        if (sellerCount >= sellerLimit) {
          return res.status(402).json({
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current plan allows ${sellerLimit} sellers. Please upgrade your subscription to add more sellers.`
          });
        }
      }

      // Check for duplicate mobile or email before OTP
      const existingSeller = await Seller.findOne({ mobile });
      if (existingSeller) {
        return res.status(400).json({ message: 'A seller with this mobile number already exists' });
      }
      const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this mobile number or email already exists' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP with form data, keyed by email
      otpStore.set(email, { otp, expiresAt, formData: { name, email, mobile, password }, managerId: req.user._id.toString() });

      // Log OTP for dev usage (acts like email delivery in dev)
      console.log(`[OTP] Seller verification OTP for ${email}: ${otp}`);

      // Return the OTP in response for dev mode; in prod you'd send via email/SMS only
      const isProduction = process.env.NODE_ENV === 'production';
      return res.json({
        message: `OTP sent to ${email}. Check the console if email is not configured.`,
        // Expose OTP in non-production so manager can complete the flow without email server
        ...(isProduction ? {} : { devOtp: otp })
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error sending OTP' });
    }
  }
);

// POST /api/sellers/verify-otp -> Verify OTP and create seller account
router.post(
  '/verify-otp',
  [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const entry = otpStore.get(email);
    if (!entry) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new OTP.' });
    }
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }
    if (entry.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }
    if (entry.managerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'OTP does not belong to this session.' });
    }

    // OTP valid – create the seller account
    otpStore.delete(email);
    const { name, mobile, password } = entry.formData;

    try {
      // Re-check duplicates (race condition safety)
      const existingSeller = await Seller.findOne({ mobile });
      if (existingSeller) {
        return res.status(400).json({ message: 'A seller with this mobile number already exists' });
      }
      const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this mobile number or email already exists' });
      }

      const user = new User({ name, email, mobile, password, role: 'seller' });
      await user.save();

      const seller = new Seller({ userId: user._id, name, mobile, password, managerId: req.user._id });
      await seller.save();

      return res.status(201).json({
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
      res.status(500).json({ message: 'Server error creating seller account' });
    }
  }
);

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
      const sellerLimit = Number(req.subscription?.planId?.maxSellers || req.subscription?.planId?.managers || 0);
      if (sellerLimit > 0) {
        const sellerCount = await Seller.countDocuments({ managerId: req.user._id });
        if (sellerCount >= sellerLimit) {
          return res.status(402).json({
            code: 'PLAN_LIMIT_REACHED',
            message: `Your current plan allows ${sellerLimit} sellers. Please upgrade your subscription to add more sellers.`
          });
        }
      }

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
