const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/auth/register -> Managers only (Admin controls seller creation via /api/sellers)
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

    const { name, email, mobile, password, role } = req.body;

    // Only managers can register themselves
    if (role !== 'manager' && role !== undefined) {
      return res.status(403).json({ message: 'Sellers cannot self-register. Contact your administrator to create an account.' });
    }

    // Check if email or mobile already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or mobile already registered' });
    }

    // Always create as manager (sellers are created via /api/sellers endpoint by admin)
    const newUser = new User({ name, email, mobile, password, role: 'manager' });
    await newUser.save();

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

module.exports = router;
