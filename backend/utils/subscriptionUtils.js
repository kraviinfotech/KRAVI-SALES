const crypto = require('crypto');
const https = require('https');
const jwt = require('jsonwebtoken');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Seller = require('../models/Seller');
const Settings = require('../models/Settings');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const toPositiveNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPlanDurationDays = (plan, fallbackDays = 14) => {
  if (!plan) return fallbackDays;
  if (toPositiveNumber(plan.durationDays)) return Number(plan.durationDays);
  if (toPositiveNumber(plan.durationMonths)) return Number(plan.durationMonths) * 30;
  return fallbackDays;
};

const getPlanSellerLimit = (plan) => {
  if (!plan) return 0;
  if (Number(plan.maxSellers) > 0) return Number(plan.maxSellers);
  const parsedManagers = parseInt(plan.managers, 10);
  return Number.isFinite(parsedManagers) && parsedManagers > 0 ? parsedManagers : 0;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days));
  return next;
};

const hasPaymentKeys = (settings) => Boolean(
  (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ||
  (settings?.paymentKeyId && settings?.paymentKeySecret)
);

const expireOldSubscriptions = async (managerId) => {
  const now = new Date();
  await Subscription.updateMany(
    { managerId, status: 'active', endDate: { $lte: now } },
    { $set: { status: 'expired' } }
  );
};

const getActiveSubscription = async (managerId) => {
  await expireOldSubscriptions(managerId);
  return Subscription.findOne({
    managerId,
    status: 'active',
    endDate: { $gt: new Date() }
  })
    .sort({ endDate: -1 })
    .populate('planId')
    .lean();
};

const getManagerIdForUser = async (user) => {
  if (!user) return null;
  if (user.role === 'manager') return user._id;
  if (user.role === 'seller') {
    const seller = await Seller.findOne({ userId: user._id }).select('managerId').lean();
    return seller?.managerId || null;
  }
  return null;
};

const buildSubscriptionStatus = async (managerId) => {
  const [subscription, currentSellers, settings] = await Promise.all([
    getActiveSubscription(managerId),
    Seller.countDocuments({ managerId }),
    Settings.findOne().lean()
  ]);

  if (!subscription) {
    return {
      status: 'expired',
      canUseApp: false,
      message: 'Your subscription has expired. Please renew your plan to continue using SalesFlow.',
      subscription: null,
      plan: null,
      endDate: null,
      daysRemaining: 0,
      currentSellers,
      paymentSettingsReady: hasPaymentKeys(settings)
    };
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return {
    status: 'active',
    canUseApp: true,
    message: null,
    subscription,
    plan: subscription.planId || null,
    endDate: subscription.endDate,
    daysRemaining,
    currentSellers,
    sellerLimit: getPlanSellerLimit(subscription.planId),
    paymentSettingsReady: hasPaymentKeys(settings)
  };
};

const assignTrialSubscription = async (managerId) => {
  const existing = await Subscription.findOne({ managerId });
  if (existing) return existing;

  const [settings, trialPlan] = await Promise.all([
    Settings.findOne().lean(),
    Plan.findOne({
      isActive: true,
      $or: [{ isTrial: true }, { price: 0 }]
    }).sort({ isTrial: -1, displayOrder: 1, createdAt: 1 })
  ]);
  const fallbackTrialDays = toPositiveNumber(settings?.trialDays, 14);

  if (!trialPlan) return null;

  const startDate = new Date();
  const endDate = addDays(startDate, getPlanDurationDays(trialPlan, fallbackTrialDays));
  const subscription = await Subscription.create({
    managerId,
    planId: trialPlan._id,
    startDate,
    endDate,
    isTrial: true,
    status: 'active',
    provider: 'system'
  });

  await User.findByIdAndUpdate(managerId, {
    subscriptionTier: trialPlan.name,
    subscriptionExpiry: endDate
  });

  return subscription;
};

const createSubscriptionFromPayment = async ({ managerId, plan, paymentId }) => {
  const startDate = new Date();
  const endDate = addDays(startDate, getPlanDurationDays(plan, 30));

  await Subscription.updateMany(
    { managerId, status: 'active' },
    { $set: { status: 'expired' } }
  );

  const subscription = await Subscription.create({
    managerId,
    planId: plan._id,
    startDate,
    endDate,
    status: 'active',
    isTrial: false,
    paymentId,
    provider: 'razorpay'
  });

  await Payment.findByIdAndUpdate(paymentId, { subscriptionId: subscription._id });
  await User.findByIdAndUpdate(managerId, {
    subscriptionTier: plan.name,
    subscriptionExpiry: endDate
  });

  return subscription.populate('planId');
};

const getSubscriptionTokenExpirySeconds = (status) => {
  if (!status?.canUseApp || !status.endDate) return 7 * 24 * 60 * 60;
  const seconds = Math.floor((new Date(status.endDate).getTime() - Date.now()) / 1000);
  return Math.max(60 * 60, seconds);
};

const signUserToken = (user, status) => jwt.sign(
  { id: user._id, role: user.role },
  getJwtSecret(),
  { expiresIn: user.role === 'admin' ? '30d' : getSubscriptionTokenExpirySeconds(status) }
);

const createRazorpayOrder = ({ keyId, keySecret, amount, currency, receipt, notes }) => new Promise((resolve, reject) => {
  const body = JSON.stringify({
    amount,
    currency,
    receipt,
    notes,
    payment_capture: 1
  });

  const request = https.request({
    hostname: 'api.razorpay.com',
    path: '/v1/orders',
    method: 'POST',
    auth: `${keyId}:${keySecret}`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (response) => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      let parsed = {};
      try {
        parsed = data ? JSON.parse(data) : {};
      } catch (err) {
        return reject(new Error('Razorpay returned an invalid response'));
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return resolve(parsed);
      }

      const error = new Error(parsed.error?.description || 'Razorpay order creation failed');
      error.statusCode = response.statusCode;
      error.razorpayCode = parsed.error?.code || '';
      reject(error);
    });
  });

  request.on('error', reject);
  request.write(body);
  request.end();
});

const verifyRazorpaySignature = ({ orderId, paymentId, signature, keySecret }) => {
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature || '');
  return expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

module.exports = {
  assignTrialSubscription,
  buildSubscriptionStatus,
  createRazorpayOrder,
  createSubscriptionFromPayment,
  getManagerIdForUser,
  getPlanDurationDays,
  getPlanSellerLimit,
  signUserToken,
  verifyRazorpaySignature
};
