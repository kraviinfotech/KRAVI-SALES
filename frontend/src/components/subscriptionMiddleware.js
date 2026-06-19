const Subscription = require('../models/Subscription');
const Seller = require('../models/Seller');

/**
 * Middleware to verify if the Manager (or the Seller's Manager) has an active subscription.
 * Admins are exempted.
 */
module.exports = async (req, res, next) => {
  // Admin has full access
  if (req.user.role === 'admin') {
    return next();
  }

  try {
    let managerId = null;

    if (req.user.role === 'manager') {
      managerId = req.user._id;
    } else if (req.user.role === 'seller') {
      // Find the manager associated with this seller
      const seller = await Seller.findOne({ userId: req.user._id });
      if (!seller) return res.status(404).json({ message: 'Seller profile not found' });
      managerId = seller.managerId;
    }

    if (!managerId) return res.status(403).json({ message: 'Account status could not be verified' });

    const sub = await Subscription.findOne({ managerId, status: 'active' }).populate('planId');
    
    if (!sub || new Date() > sub.endDate) {
      if (sub && sub.status === 'active') {
        sub.status = 'expired';
        await sub.save();
      }
      return res.status(403).json({ message: 'Your subscription has expired. Please renew your plan to continue using SalesFlow.' });
    }

    req.subscription = sub; // Attach subscription for limit checks
    next();
  } catch (err) {
    console.error('Subscription Middleware Error:', err);
    res.status(500).json({ message: 'Internal server error during subscription check' });
  }
};