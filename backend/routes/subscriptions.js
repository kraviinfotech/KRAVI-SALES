const express = require('express');
const { body, validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  buildSubscriptionStatus,
  createRazorpayOrder,
  createSubscriptionFromPayment,
  getManagerIdForUser,
  getPlanDurationDays,
  getPlanSellerLimit,
  signUserToken,
  verifyRazorpaySignature
} = require('../utils/subscriptionUtils');

const router = express.Router();

router.use(authMiddleware);

router.get('/plans', async (req, res) => {
  try {
    if (!['manager', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only managers can view subscription plans' });
    }

    const plans = await Plan.find({ isActive: true })
      .sort({ isTrial: -1, displayOrder: 1, price: 1, durationMonths: 1 })
      .lean();

    res.json(plans.map(plan => ({
      ...plan,
      durationDays: getPlanDurationDays(plan),
      maxSellers: getPlanSellerLimit(plan)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load subscription plans' });
  }
});

router.get('/my-status', async (req, res) => {
  try {
    const managerId = await getManagerIdForUser(req.user);
    if (!managerId) {
      return res.status(403).json({ message: 'Subscription status is available for manager accounts and their sellers only' });
    }

    const status = await buildSubscriptionStatus(managerId);
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load subscription status' });
  }
});

router.post(
  '/checkout/order',
  roleMiddleware('manager'),
  [body('planId').isMongoId().withMessage('A valid plan is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const plan = await Plan.findOne({ _id: req.body.planId, isActive: true });
      if (!plan) return res.status(404).json({ message: 'Plan not found' });
      if (Number(plan.price) <= 0) {
        return res.status(400).json({ message: 'Free trial plans are assigned automatically and cannot be purchased' });
      }

      const settings = await Settings.findOne();
      if (!settings?.paymentKeyId || !settings?.paymentKeySecret) {
        return res.status(400).json({ message: 'Payment gateway is not configured. Please contact the administrator.' });
      }

      const amountInPaise = Math.round(Number(plan.price) * 100);
      const receipt = `sub_${String(req.user._id).slice(-8)}_${Date.now()}`;
      const order = await createRazorpayOrder({
        keyId: settings.paymentKeyId,
        keySecret: settings.paymentKeySecret,
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        receipt,
        notes: {
          managerId: String(req.user._id),
          planId: String(plan._id),
          planName: plan.name
        }
      });

      await Payment.create({
        managerId: req.user._id,
        amount: plan.price,
        currency: plan.currency || 'INR',
        provider: 'razorpay',
        transactionId: order.id,
        razorpayOrderId: order.id,
        status: 'pending',
        metadata: {
          planId: String(plan._id),
          planName: plan.name,
          receipt
        }
      });

      res.json({
        keyId: settings.paymentKeyId,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt
        },
        plan: {
          _id: plan._id,
          name: plan.name,
          price: plan.price,
          currency: plan.currency || 'INR',
          durationDays: getPlanDurationDays(plan),
          maxSellers: getPlanSellerLimit(plan)
        },
        user: {
          name: req.user.name,
          email: req.user.email,
          mobile: req.user.mobile
        }
      });
    } catch (err) {
      console.error('Razorpay order error:', err);
      res.status(500).json({ message: err.message || 'Failed to start payment' });
    }
  }
);

router.post(
  '/checkout/verify',
  roleMiddleware('manager'),
  [
    body('planId').isMongoId().withMessage('A valid plan is required'),
    body('razorpay_order_id').trim().notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').trim().notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').trim().notEmpty().withMessage('Payment signature is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        planId,
        razorpay_order_id: orderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      } = req.body;

      const [settings, plan, payment] = await Promise.all([
        Settings.findOne(),
        Plan.findOne({ _id: planId, isActive: true }),
        Payment.findOne({ managerId: req.user._id, razorpayOrderId: orderId, status: 'pending' })
      ]);

      if (!settings?.paymentKeySecret) {
        return res.status(400).json({ message: 'Payment gateway is not configured' });
      }
      if (!plan) return res.status(404).json({ message: 'Plan not found' });
      if (!payment) return res.status(404).json({ message: 'Pending payment not found' });

      const isValid = verifyRazorpaySignature({
        orderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        keySecret: settings.paymentKeySecret
      });

      if (!isValid) {
        payment.status = 'failed';
        payment.failureReason = 'Invalid Razorpay payment signature';
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        await payment.save();
        return res.status(400).json({ message: 'Payment verification failed' });
      }

      payment.status = 'success';
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save();

      const subscription = await createSubscriptionFromPayment({
        managerId: req.user._id,
        plan,
        paymentId: payment._id
      });

      const freshUser = await User.findById(req.user._id).select('-password');
      const status = await buildSubscriptionStatus(req.user._id);
      const token = signUserToken(freshUser, status);

      res.json({
        message: 'Subscription activated successfully',
        subscription,
        status,
        token,
        user: {
          _id: freshUser._id,
          name: freshUser.name,
          email: freshUser.email,
          mobile: freshUser.mobile,
          role: freshUser.role,
          managerScannerPhoto: freshUser.managerScannerPhoto || null,
          subscriptionTier: freshUser.subscriptionTier || null,
          subscriptionExpiry: freshUser.subscriptionExpiry || null
        }
      });
    } catch (err) {
      console.error('Razorpay verify error:', err);
      res.status(500).json({ message: err.message || 'Failed to verify payment' });
    }
  }
);

module.exports = router;
