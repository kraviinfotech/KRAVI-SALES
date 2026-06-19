const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  assignTrialSubscription,
  buildSubscriptionStatus,
  getManagerIdForUser,
  signUserToken
} = require('../utils/subscriptionUtils');

// POST /api/auth/register -> public manager registration with admin-configured trial
router.post(
  '/register',
  [
    body('name').exists().withMessage('Name is required').trim().notEmpty(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('mobile').isMobilePhone('any').withMessage('Valid mobile is required').trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['manager']).withMessage('Public registration is only available for managers')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, mobile, password } = req.body;
      // Normalize email
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      const normalizedMobile = mobile ? mobile.trim() : null;

      // Prevent duplicates
      const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
      if (existing) {
        return res.status(400).json({ message: 'Email or mobile already registered' });
      }

      const role = 'manager';

      const user = new User({ name, email: normalizedEmail, mobile: normalizedMobile, password, role });
      await user.save();

      // Automatically assign the admin-configured free/trial plan to new Managers
      if (role === 'manager') {
        await assignTrialSubscription(user._id);
      }

      return res.status(201).json({ message: 'User registered successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/login – real authentication (email or mobile)
router.post(
  '/login',
  [
    // Ensure at least email or mobile is provided
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.mobile) {
        throw new Error('Either email or mobile number must be provided');
      }
      return true;
    }),
    body('password')
      .exists()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, mobile, password } = req.body;
    const trimmedMobile = mobile ? mobile.trim() : null;
    // Normalize email to lowercase to match schema storage
    const trimmedEmail = email ? email.trim().toLowerCase() : null;

    // Dev logging to help diagnose missing users (safe for local dev)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth login attempt - email:', trimmedEmail, 'mobile:', trimmedMobile);
    }

    // Find user by mobile or email
    let user = null;
    if (trimmedMobile) {
      user = await User.findOne({ mobile: trimmedMobile });
    } else if (trimmedEmail) {
      user = await User.findOne({ email: trimmedEmail });
    }

    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Auth lookup: user not found for', trimmedEmail || trimmedMobile);
      }
      if (trimmedMobile) {
        return res.status(400).json({ message: 'Mobile number not registered' });
      }
      if (trimmedEmail) {
        return res.status(400).json({ message: 'Email not registered' });
      }
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    let subscriptionStatus = null;
    const managerId = await getManagerIdForUser(user);
    if (managerId) {
      subscriptionStatus = await buildSubscriptionStatus(managerId);
    }

    const token = signUserToken(user, subscriptionStatus);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        managerScannerPhoto: user.managerScannerPhoto || null,
        subscriptionTier: user.subscriptionTier || null,
        subscriptionExpiry: user.subscriptionExpiry || null
      },
      subscriptionStatus
    });
  }
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.mobile) {
        throw new Error('Email or mobile number is required');
      }
      return true;
    }),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('mobile')
      .optional()
      .isMobilePhone('any').withMessage('Invalid mobile number')
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, mobile } = req.body;
    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    const trimmedMobile = mobile ? mobile.trim() : null;

    let user = null;
    if (trimmedEmail && trimmedMobile) {
      user = await User.findOne({ $or: [{ email: trimmedEmail }, { mobile: trimmedMobile }] });
    } else if (trimmedEmail) {
      user = await User.findOne({ email: trimmedEmail });
    } else if (trimmedMobile) {
      user = await User.findOne({ mobile: trimmedMobile });
    }

    if (!user) {
      return res.json({ message: 'If the email or mobile is registered, an OTP has been sent to the registered email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, send the OTP via email or SMS. Here we log it for development.
    console.log(`Password reset OTP for ${user.email || user.mobile}: ${otp}`);

    return res.json({ message: 'If the email or mobile is registered, an OTP has been sent to the registered email.' });
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token')
      .exists().withMessage('Token is required'),
    body('newPassword')
      .exists().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.password = newPassword; // pre-save hook will hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    if (user.role === 'seller') {
      await Seller.findOneAndUpdate({ userId: user._id }, { password: newPassword }).catch(() => null);
    }

    return res.json({ message: 'Password has been reset successfully' });
  }
);

// GET /api/auth/me -> return current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  const { _id, name, email, mobile, role, managerScannerPhoto } = req.user;
  res.json({
    user: {
      _id,
      name,
      email,
      mobile,
      role,
      managerScannerPhoto: managerScannerPhoto || null,
      subscriptionTier: req.user.subscriptionTier || null,
      subscriptionExpiry: req.user.subscriptionExpiry || null
    }
  });
});

// PATCH /api/auth/me/scanner -> manager uploads default scanner image
router.patch(
  '/me/scanner',
  authMiddleware,
  roleMiddleware('manager'),
  [
    body('managerScannerPhoto').optional().custom((value) => {
      if (value !== null && typeof value !== 'string') {
        throw new Error('Scanner image must be a base64 string or null');
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const manager = await User.findById(req.user._id);
      if (!manager) {
        return res.status(404).json({ message: 'Manager not found' });
      }

      manager.managerScannerPhoto = req.body.managerScannerPhoto || null;
      await manager.save();

      res.json({
        message: 'Manager scanner updated successfully',
        managerScannerPhoto: manager.managerScannerPhoto || null
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error updating scanner image' });
    }
  }
);

// GET /api/auth/manager-scanner -> return default manager scanner proof to authenticated users
router.get('/manager-scanner', authMiddleware, async (req, res) => {
  try {
    let managerId;
    if (req.user.role === 'manager') {
      managerId = req.user._id;
    } else {
      // Find this seller's manager
      const seller = await Seller.findOne({ userId: req.user._id });
      if (!seller || !seller.managerId) {
        return res.status(404).json({ message: 'Manager not found for this account' });
      }
      managerId = seller.managerId;
    }

    const manager = await User.findOne({ _id: managerId, managerScannerPhoto: { $exists: true, $ne: null } });
    if (!manager || !manager.managerScannerPhoto) {
      // Return 200 with null instead of 404 to handle missing scanner gracefully in frontend
      return res.json({ scannerPhoto: null });
    }

    res.json({ scannerPhoto: manager.managerScannerPhoto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching manager scanner' });
  }
});

// Development helper: lookup user by email (only in non-production)
// GET /api/auth/debug-user?email=foo@example.com
router.get('/debug-user', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  const email = req.query.email ? req.query.email.trim().toLowerCase() : null;
  if (!email) return res.status(400).json({ message: 'Email query required' });
  try {
    const user = await User.findOne({ email }).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Debug-user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
