
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
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
const { validatePassword } = require('../utils/passwordUtils');
const { sendEmail, buildWelcomeEmail, buildOtpEmail } = require('../utils/emailUtils');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registrationOtpStore = new Map();

const TERMS_VERSION = process.env.TERMS_VERSION || '1.0';

const getRequestIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
};

const getBrowserFromUA = (ua = '') => {
  if (/chrome/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome|chromium/i.test(ua)) return 'Safari';
  if (/edg|edge/i.test(ua)) return 'Edge';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/mobile/i.test(ua)) return 'Mobile Browser';
  return 'Unknown Browser';
};

const getDeviceFromUA = (ua = '') => {
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) return 'Mobile/Tablet';
  return 'Desktop';
};

const addLoginHistoryEntry = (user, { success, ip, browser, device, reason }) => {
  if (!Array.isArray(user.loginHistory)) {
    user.loginHistory = [];
  }
  user.loginHistory.push({ success, ip, browser, device, reason });
  if (user.loginHistory.length > 50) {
    user.loginHistory = user.loginHistory.slice(-50);
  }
};

// POST /api/auth/register -> public manager registration with admin-configured trial
router.post('/register',
  [
    body('name').exists().withMessage('Name is required').trim().notEmpty(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('mobile').isMobilePhone('any').withMessage('Valid mobile is required').trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('acceptedTerms')
      .custom((value) => value === true || value === 'true')
      .withMessage('You must accept the Terms & Privacy Policy'),
    body('role').optional().isIn(['manager']).withMessage('Public registration is only available for managers')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, mobile, password, acceptedTerms } = req.body;
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      const normalizedMobile = mobile ? mobile.trim() : null;
      const agreedToTerms = acceptedTerms === true || acceptedTerms === 'true';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ip = getRequestIp(req);
      const browser = getBrowserFromUA(userAgent);
      const device = getDeviceFromUA(userAgent);

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.errors.join(' ') });
      }

      const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
      if (existing) {
        return res.status(400).json({ message: 'Email or mobile already registered' });
      }

      const role = 'manager';

      const user = new User({
        name,
        email: normalizedEmail,
        mobile: normalizedMobile,
        password,
        role,
        termsAccepted: agreedToTerms,
        termsAcceptedVersion: agreedToTerms ? TERMS_VERSION : null,
        termsAcceptedAt: agreedToTerms ? new Date() : null,
        termsAcceptedIp: agreedToTerms ? ip : null,
        termsAcceptedDevice: agreedToTerms ? device : null
      });
      await user.save();

      if (role === 'manager') {
        await assignTrialSubscription(user._id);
      }

      sendEmail({
        to: user.email,
        ...buildWelcomeEmail(user)
      }).catch((sendErr) => {
        console.error('Welcome email failed:', sendErr);
      });

      return res.status(201).json({ message: 'User registered successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role, termsAccepted: user.termsAccepted, termsAcceptedVersion: user.termsAcceptedVersion } });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/send-registration-otp -> Public manager registration OTP request
router.post(
  '/send-registration-otp',
  [
    body('name').exists().withMessage('Name is required').trim().notEmpty(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('mobile').isMobilePhone('any').withMessage('Valid mobile is required').trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('acceptedTerms')
      .custom((value) => value === true || value === 'true')
      .withMessage('You must accept the Terms & Privacy Policy'),

  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
const { name, email, mobile, password, acceptedTerms } = req.body;
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedMobile = mobile.trim();
      const agreedToTerms = acceptedTerms === true || acceptedTerms === 'true';

      const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
      if (existing) {
        return res.status(400).json({ message: 'Email or mobile already registered' });
      }

      const otp = crypto.randomInt(100000, 1000000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      registrationOtpStore.set(normalizedEmail, {
        otp,
        expiresAt,
formData: {
  name,
  email: normalizedEmail,
  mobile: normalizedMobile,
  password,
  acceptedTerms: agreedToTerms
}      });

      try {
        await sendEmail({
          to: normalizedEmail,
          ...buildOtpEmail({ name, email: normalizedEmail, otp })
        });
      } catch (sendErr) {
        console.error('Registration OTP email failed:', sendErr);
        registrationOtpStore.delete(normalizedEmail);
        return res.status(500).json({ message: 'Unable to send OTP email. Please try again later.' });
      }

      return res.json({ message: `OTP sent to ${normalizedEmail}. Please check your email for the verification code.` });
    } catch (err) {
      console.error('Registration OTP error:', err);
      return res.status(500).json({ message: 'Server error sending OTP' });
    }
  }
);

// POST /api/auth/verify-registration-otp -> Verify OTP and complete manager registration
router.post(
  '/verify-registration-otp',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const entry = registrationOtpStore.get(normalizedEmail);

    if (!entry) {
      return res.status(400).json({ message: 'No OTP found for this email. Please request a new OTP.' });
    }
    if (Date.now() > entry.expiresAt) {
      registrationOtpStore.delete(normalizedEmail);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }
    if (!crypto.timingSafeEqual(Buffer.from(entry.otp), Buffer.from(otp.trim()))) {
      return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }

    const { name, mobile, password, acceptedTerms } = entry.formData;
    registrationOtpStore.delete(normalizedEmail);

    try {
      const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile }] });
      if (existing) {
        return res.status(400).json({ message: 'Email or mobile already registered' });
      }

      const user = new User({
        name,
        email: normalizedEmail,
        mobile,
        password,
        role: 'manager',
        termsAccepted: acceptedTerms,
        termsAcceptedVersion: acceptedTerms ? TERMS_VERSION : null,
        termsAcceptedAt: acceptedTerms ? new Date() : null
      });
      await user.save();

      await assignTrialSubscription(user._id);

      sendEmail({
        to: normalizedEmail,
        ...buildWelcomeEmail(user)
      }).catch((sendErr) => {
        console.error('Welcome email failed after registration OTP:', sendErr);
      });

      return res.status(201).json({ message: 'Registration completed successfully.' });
    } catch (err) {
      console.error('Verify registration OTP error:', err);
      return res.status(500).json({ message: 'Server error completing registration' });
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
    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = getRequestIp(req);
    const browser = getBrowserFromUA(userAgent);
    const device = getDeviceFromUA(userAgent);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth login attempt - email:', trimmedEmail, 'mobile:', trimmedMobile);
    }

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

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      addLoginHistoryEntry(user, {
        success: false,
        ip,
        browser,
        device,
        reason: 'Account is locked'
      });
      await user.save();
      return res.status(403).json({ message: `Account temporarily locked until ${user.lockedUntil.toLocaleString()}. Please try again later or contact admin.` });
    }

    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      user.lockedUntil = undefined;
      user.failedAttempts = 0;
      user.lastFailedAttempt = undefined;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const now = new Date();
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      user.lastFailedAttempt = now;
      const reachedLock = user.failedAttempts >= 5;
      if (reachedLock) {
        user.lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      addLoginHistoryEntry(user, {
        success: false,
        ip,
        browser,
        device,
        reason: reachedLock ? 'Account locked due to repeated failed login attempts' : 'Incorrect password'
      });
      await user.save();
      if (reachedLock) {
        return res.status(403).json({ message: `Too many failed login attempts. Account locked until ${user.lockedUntil.toLocaleString()}.` });
      }
      return res.status(400).json({ message: 'Incorrect password' });
    }

    user.failedAttempts = 0;
    user.lastFailedAttempt = undefined;
    user.lockedUntil = undefined;
    addLoginHistoryEntry(user, {
      success: true,
      ip,
      browser,
      device,
      reason: 'Login successful'
    });
    await user.save();

    let subscriptionStatus = null;
    const managerId = await getManagerIdForUser(user);
    if (managerId) {
      subscriptionStatus = await buildSubscriptionStatus(managerId);
    }

    const token = signUserToken(user, subscriptionStatus);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        managerScannerPhoto: user.managerScannerPhoto || null,
        subscriptionTier: user.subscriptionTier || null,
        subscriptionExpiry: user.subscriptionExpiry || null,
        termsAccepted: user.termsAccepted || false,
        termsAcceptedVersion: user.termsAcceptedVersion || null
      },
      subscriptionStatus
    });
  }
);

router.post(
  '/google',
  [
    body('idToken')
      .exists()
      .withMessage('Google ID token is required')
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idToken } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ message: 'Google OAuth is not configured' });
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: clientId
      });
      const payload = ticket.getPayload();
      const email = payload?.email?.toLowerCase();
      const emailVerified = payload?.email_verified;

      if (!email || !emailVerified) {
        return res.status(400).json({ message: 'Google account must have a verified email' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: 'No account is associated with this Google email. Please register with that email first.'
        });
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(403).json({ message: `Account temporarily locked until ${user.lockedUntil.toLocaleString()}.` });
      }

      user.failedAttempts = 0;
      user.lastFailedAttempt = undefined;
      user.lockedUntil = undefined;
      addLoginHistoryEntry(user, {
        success: true,
        ip: getRequestIp(req),
        browser: getBrowserFromUA(req.headers['user-agent']),
        device: getDeviceFromUA(req.headers['user-agent']),
        reason: 'Google login successful'
      });
      await user.save();

      const managerId = await getManagerIdForUser(user);
      const subscriptionStatus = managerId ? await buildSubscriptionStatus(managerId) : null;
      const token = signUserToken(user, subscriptionStatus);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          managerScannerPhoto: user.managerScannerPhoto || null,
          subscriptionTier: user.subscriptionTier || null,
          subscriptionExpiry: user.subscriptionExpiry || null,
          termsAccepted: user.termsAccepted || false,
          termsAcceptedVersion: user.termsAcceptedVersion || null
        },
        subscriptionStatus
      });
    } catch (err) {
      console.error('Google Auth error:', err);
      return res.status(401).json({ message: 'Unable to verify Google sign-in token' });
    }
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

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        ...buildOtpEmail({ name: user.name, email: user.email, otp })
      });
    } catch (sendErr) {
      console.error('Password reset email failed:', sendErr);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: 'Unable to send password reset OTP. Please try again later.' });
    }

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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { token, newPassword } = req.body;
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.errors.join(' ') });
    }

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
  const { _id, name, email, mobile, role, managerScannerPhoto, termsAccepted, termsAcceptedVersion } = req.user;
  res.json({
    user: {
      _id,
      name,
      email,
      mobile,
      role,
      managerScannerPhoto: managerScannerPhoto || null,
      subscriptionTier: req.user.subscriptionTier || null,
      subscriptionExpiry: req.user.subscriptionExpiry || null,
      termsAccepted: termsAccepted || false,
      termsAcceptedVersion: termsAcceptedVersion || null
    }
  });
});

// POST /api/auth/accept-terms -> save acceptance metadata
router.post(
  '/accept-terms',
  authMiddleware,
  [
    body('acceptedCompanyAcceptance')
      .custom((value) => value === true || value === 'true')
      .withMessage('Company acceptance is required'),
    body('acceptedTermsAndConditions')
      .custom((value) => value === true || value === 'true')
      .withMessage('Terms and conditions acceptance is required'),
    body('acceptedPrivacyPolicy')
      .custom((value) => value === true || value === 'true')
      .withMessage('Privacy policy acceptance is required'),
    body('acceptedCompanyPolicies')
      .custom((value) => value === true || value === 'true')
      .withMessage('Company policies acceptance is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ip = getRequestIp(req);
      const browser = getBrowserFromUA(userAgent);
      const device = getDeviceFromUA(userAgent);

      user.termsAccepted = true;
      user.termsAcceptedVersion = TERMS_VERSION;
      user.termsAcceptedAt = new Date();
      user.termsAcceptedIp = ip;
      user.termsAcceptedDevice = device;
      await user.save();

      res.json({
        message: 'Terms accepted successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          termsAccepted: user.termsAccepted,
          termsAcceptedVersion: user.termsAcceptedVersion
        }
      });
    } catch (err) {
      console.error('Accept terms error:', err);
      res.status(500).json({ message: 'Server error saving acceptance' });
    }
  }
);

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




router.get("/test-email", async (req, res) => {
  try {
    const email = buildWelcomeEmail({
      name: "Developer Om"
    });

    const info = await sendEmail({
      to: "ommaheshwagh2003@gmail.com",
      subject: email.subject,
      text: email.text,
      html: email.html
    });

    console.log("Email sent:", info);

    res.json({
      success: true,
      message: "Test email sent!",
      info
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;