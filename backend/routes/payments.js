const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth, role('admin'));

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const upcomingExpires = new Date();
    upcomingExpires.setDate(upcomingExpires.getDate() + 30);

    const [totalRevenueAgg, monthlyRevenueAgg, yearlyRevenueAgg, pendingPaymentsAgg, upcomingRenewals, payments] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Subscription.countDocuments({
        status: 'active',
        endDate: { $gte: now, $lte: upcomingExpires }
      }),
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('managerId', 'name email mobile')
        .populate({
          path: 'subscriptionId',
          select: 'planId startDate endDate status',
          populate: { path: 'planId', select: 'name price durationMonths durationDays' }
        })
        .lean()
    ]);

    const subscriptionTransactions = payments.map(payment => ({
      _id: payment._id,
      managerId: payment.managerId?._id,
      name: payment.managerId?.name || 'Manager',
      email: payment.managerId?.email || '',
      phone: payment.managerId?.mobile || '',
      plan: payment.subscriptionId?.planId?.name || payment.metadata?.planName || 'Subscription',
      startDate: payment.subscriptionId?.startDate || payment.createdAt,
      expiryDate: payment.subscriptionId?.endDate || null,
      status: payment.subscriptionId?.status || payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      paymentMethod: payment.provider === 'razorpay' ? 'Razorpay' : payment.provider,
      paymentStatus: payment.status === 'success' ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Failed',
      transactionId: payment.razorpayPaymentId || payment.transactionId,
      invoice: `INV-${String(payment._id).slice(-6).toUpperCase()}`,
      createdAt: payment.createdAt
    }));

    res.json({
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
      yearlyRevenue: yearlyRevenueAgg[0]?.total || 0,
      pendingPayments: pendingPaymentsAgg[0]?.total || 0,
      upcomingRenewals,
      subscriptionTransactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payments data' });
  }
});

module.exports = router;
