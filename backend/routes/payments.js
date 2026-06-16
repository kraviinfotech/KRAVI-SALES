const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Admin-only endpoint: this route returns only manager subscription payment data.
// Sales payment records are intentionally kept in manager/report routes and not surfaced here.
router.use(auth, role('admin'));

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const totalRevenueAgg = await Company.aggregate([
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: 'name',
          as: 'planData'
        }
      },
      { $unwind: { path: '$planData', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$planData.price', 0] } } } }
    ]);

    const monthlyRevenueAgg = await Company.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: 'name',
          as: 'planData'
        }
      },
      { $unwind: { path: '$planData', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$planData.price', 0] } }, pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, { $ifNull: ['$planData.price', 0] }, 0] } } } }
    ]);

    const yearlyRevenueAgg = await Company.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: 'name',
          as: 'planData'
        }
      },
      { $unwind: { path: '$planData', preserveNullAndEmptyArrays: true } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$planData.price', 0] } } } }
    ]);

    const upcomingExpires = new Date();
    upcomingExpires.setDate(upcomingExpires.getDate() + 30);

    const upcomingRenewalsCount = await Company.countDocuments({
      expiryDate: { $gte: now, $lte: upcomingExpires }
    });

    const subscriptionTransactions = await Company.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'plans',
          localField: 'plan',
          foreignField: 'name',
          as: 'planData'
        }
      },
      { $unwind: { path: '$planData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          plan: 1,
          startDate: 1,
          expiryDate: 1,
          status: 1,
          amount: { $ifNull: ['$planData.price', 0] },
          paymentMethod: { $literal: 'Subscription' },
          paymentStatus: '$status',
          invoice: { $concat: ['INV-', { $substr: ['$_id', -6, 6] }] },
          createdAt: 1
        }
      }
    ]);

    res.json({
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
      pendingPayments: monthlyRevenueAgg[0]?.pending || 0,
      upcomingRenewals: upcomingRenewalsCount,
      subscriptionTransactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payments data' });
  }
});

module.exports = router;
