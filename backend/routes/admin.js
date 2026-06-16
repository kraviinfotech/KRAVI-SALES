const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const SalesRecord = require('../models/SalesRecord');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect admin routes
router.use(authMiddleware, roleMiddleware('admin'));

// GET /api/admin/overview -> admin dashboard aggregates
router.get('/overview', async (req, res) => {
  try {
    const totalCompanies = await User.countDocuments({ role: 'manager' });
    const totalManagers = totalCompanies;

    // Revenue computations (global)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const monthlySales = await SalesRecord.aggregate([
      { $match: { visitDatetime: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const yearlySales = await SalesRecord.aggregate([
      { $match: { visitDatetime: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingSales = await SalesRecord.aggregate([
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
    ]);

    // Recent companies (managers)
    const recentManagers = await User.find({ role: 'manager' }).sort({ createdAt: -1 }).limit(5).select('name email mobile createdAt').lean();

    // Plan distribution: compute from Company.plan if available
    const Company = require('../models/Company');
    const planAgg = await Company.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    const totalCompaniesCount = planAgg.reduce((s, p) => s + p.count, 0) || totalCompanies;
    const planDistribution = ['Basic', 'Professional', 'Enterprise'].map((name) => {
      const found = planAgg.find(p => p._id === name);
      const val = totalCompaniesCount ? Math.round((found ? found.count : 0) / Math.max(1, totalCompaniesCount) * 100) : 0;
      return { name, val };
    });

    res.json({
      totalCompanies,
      activeCompanies: totalCompanies, // fallback
      expiredCompanies: 0,
      trialCompanies: 0,
      totalManagers,
      monthlyRevenue: monthlySales[0]?.total || 0,
      yearlyRevenue: yearlySales[0]?.total || 0,
      totalPending: pendingSales[0]?.total || 0,
      pendingRenewals: 0,
      planDistribution,
      recentCompanies: recentManagers.map(m => ({
        id: m._id,
        name: m.name,
        email: m.email,
        phone: m.mobile,
        createdAt: m.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving admin overview' });
  }
});

module.exports = router;
