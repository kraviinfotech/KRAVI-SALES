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

    const [monthlySales, yearlySales, pendingSales, recentManagers, planAgg] = await Promise.all([
      SalesRecord.aggregate([
        { $match: { visitDatetime: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      SalesRecord.aggregate([
        { $match: { visitDatetime: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      SalesRecord.aggregate([
        { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
      ]),
      User.find({ role: 'manager' }).sort({ createdAt: -1 }).limit(5).select('name email mobile createdAt').lean(),
      (async () => {
        const Company = require('../models/Company');
        return Company.aggregate([
          { $group: { _id: '$plan', count: { $sum: 1 } } }
        ]);
      })()
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

// GET /api/admin/managers -> Get all managers
router.get('/managers', async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .select('name email mobile designation photo managerScannerPhoto company isActive createdAt failedAttempts lockedUntil loginHistory termsAccepted termsAcceptedVersion')
      .sort({ createdAt: -1 })
      .lean();
    res.json(managers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving managers' });
  }
});

// PATCH /api/admin/managers/:id/unlock -> Manually unlock a manager account
router.patch('/managers/:id/unlock', async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);
    if (!manager || manager.role !== 'manager') return res.status(404).json({ message: 'Manager not found' });
    manager.lockedUntil = undefined;
    manager.failedAttempts = 0;
    manager.lastFailedAttempt = undefined;
    await manager.save();
    res.json({ message: 'Manager account unlocked successfully', manager });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error unlocking manager' });
  }
});

// PATCH /api/admin/managers/:id -> Update manager
router.patch('/managers/:id', async (req, res) => {
  try {
    const { name, email, mobile, designation, isActive, photo } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (designation) updateData.designation = designation;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (photo) updateData.photo = photo;

    const manager = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json(manager);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating manager' });
  }
});

// DELETE /api/admin/managers/:id -> Delete manager
router.delete('/managers/:id', async (req, res) => {
  try {
    const manager = await User.findByIdAndDelete(req.params.id);
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json({ message: 'Manager deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting manager' });
  }
});

// POST /api/admin/reset-manager-password -> Send password reset link
router.post('/reset-manager-password', async (req, res) => {
  try {
    const { email } = req.body;
    const manager = await User.findOne({ email, role: 'manager' });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });

    // Generate reset token (in production, use crypto and send email)
    const resetToken = require('crypto').randomBytes(20).toString('hex');
    manager.resetPasswordToken = resetToken;
    manager.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await manager.save();

    // TODO: Send email with reset link
    res.json({ message: 'Password reset link sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

module.exports = router;
