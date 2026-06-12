const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').exists().withMessage('Name is required').trim(),
    body('email')
      .exists().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('mobile')
      .exists().withMessage('Mobile number is required')
      .isMobilePhone('any').withMessage('Invalid mobile number')
      .trim(),
    body('password')
      .exists().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobile, password, role = 'seller' } = req.body;

    // Check if email or mobile already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or mobile already registered' });
    }

    // Create new user (password hashing handled by schema pre-save hook)
    const newUser = new User({ name, email, mobile, password, role });
    await newUser.save();

    if (role === 'seller') {
      // Create seller profile
      const seller = new Seller({
        userId: newUser._id,
        name,
        mobile
      });
      
      try {
        await seller.save();
      } catch (saveErr) {
        // Rollback user creation if profile creation fails
        await User.findByIdAndDelete(newUser._id);
        throw saveErr;
      }
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'super_secret_sales_tracker_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role,
        managerScannerPhoto: newUser.managerScannerPhoto || null
      }
    });
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
    const trimmedEmail = email ? email.trim() : null;

    // Find user by mobile or email
    let user = null;
    if (trimmedMobile) {
      user = await User.findOne({ mobile: trimmedMobile });
    } else if (trimmedEmail) {
      user = await User.findOne({ email: trimmedEmail });
    }

    if (!user) {
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_sales_tracker_key_2026',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        managerScannerPhoto: user.managerScannerPhoto || null
      }
    });
  }
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  [
    body('email')
      .exists().withMessage('Email is required')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists
      return res.json({ message: 'If the email is registered, a reset link will be sent.' });
    }
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // In a real app, send email. Here we just log the link.
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5174'}/reset-password/${token}`;
    console.log('Password reset link:', resetLink);
    return res.json({ message: 'If the email is registered, a reset link will be sent.' });
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
      managerScannerPhoto: managerScannerPhoto || null
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
    const manager = await User.findOne({ role: 'manager', managerScannerPhoto: { $exists: true, $ne: null } });
    if (!manager) {
      return res.status(404).json({ message: 'No manager scanner configured' });
    }

    res.json({ scannerPhoto: manager.managerScannerPhoto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching manager scanner' });
  }
});

module.exports = router;
