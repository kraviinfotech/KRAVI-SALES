const express = require('express');
const CallLog = require('../models/CallLog');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const getTenantIdForUser = async (user) => {
  if (!user) return null;
  if (user.role === 'manager') return user._id;

  if (user.role === 'seller') {
    const seller = await Seller.findOne({ userId: user._id }).select('managerId').lean();
    return seller?.managerId || null;
  }

  return null;
};

router.use(authMiddleware);

// GET /api/calls/contacts
router.get('/contacts', async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      const sellers = await Seller.find({ managerId: req.user._id })
        .sort({ name: 1 })
        .populate('userId', 'name email mobile role')
        .lean();

      return res.json({
        contacts: sellers
          .filter((seller) => seller.userId?._id)
          .map((seller) => ({
            id: String(seller.userId._id),
            sellerId: String(seller._id),
            name: seller.name || seller.userId.name,
            mobile: seller.mobile || seller.userId.mobile,
            email: seller.userId.email || null,
            role: 'seller',
          })),
      });
    }

    if (req.user.role === 'seller') {
      const seller = await Seller.findOne({ userId: req.user._id })
        .populate('managerId', 'name email mobile role')
        .lean();

      if (!seller?.managerId?._id) {
        return res.json({ contacts: [] });
      }

      return res.json({
        contacts: [
          {
            id: String(seller.managerId._id),
            name: seller.managerId.name,
            mobile: seller.managerId.mobile || null,
            email: seller.managerId.email || null,
            role: 'manager',
          },
        ],
      });
    }

    return res.json({ contacts: [] });
  } catch (err) {
    console.error('Call contacts error:', err);
    return res.status(500).json({ message: 'Call contacts could not be loaded.' });
  }
});

// GET /api/calls/history
router.get('/history', async (req, res) => {
  try {
    const tenantId = await getTenantIdForUser(req.user);

    if (!tenantId) {
      return res.json({ calls: [] });
    }

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const calls = await CallLog.find({
      tenantId,
      $or: [
        { 'caller.userId': req.user._id },
        { 'receiver.userId': req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ calls });
  } catch (err) {
    console.error('Call history error:', err);
    return res.status(500).json({ message: 'Call history could not be loaded.' });
  }
});

// GET /api/calls/stats
router.get('/stats', async (req, res) => {
  try {
    const tenantId = await getTenantIdForUser(req.user);

    if (!tenantId) {
      return res.json({ missedCount: 0 });
    }

    const missedCount = await CallLog.countDocuments({
      tenantId,
      'receiver.userId': req.user._id,
      status: 'missed',
    });

    return res.json({ missedCount });
  } catch (err) {
    console.error('Call stats error:', err);
    return res.status(500).json({ message: 'Call stats could not be loaded.' });
  }
});

module.exports = router;
