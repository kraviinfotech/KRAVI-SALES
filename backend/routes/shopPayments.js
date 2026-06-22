const express = require('express');
const router = express.Router();
const ShopPayment = require('../models/ShopPayment');
const SalesRecord = require('../models/SalesRecord');
const Notification = require('../models/Notification');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');
const managerRecentPaymentsLimit = 20;
const managerCollectionsPageSize = 20;

// ============================================
// SELLER ROUTES
// ============================================

// POST /api/shoppayments/receive
// Seller receives payment against a record
router.post('/receive', authMiddleware, roleMiddleware('seller'), subscriptionMiddleware, async (req, res) => {
  try {
    const { salesRecordId, amount, mode, txnId, remarks, paymentPhoto } = req.body;
    const userId = req.user._id;

    // Get seller info
    const seller = await Seller.findOne({ userId });
    if (!seller) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    // Find the Sales Record
    const record = await SalesRecord.findById(salesRecordId);
    if (!record) {
      return res.status(404).json({ message: 'Sales record not found' });
    }

    // Check if it belongs to this seller
    if (record.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this record' });
    }

    // Validate amounts
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }
    
    // Safety check - we shouldn't allow paying more than pending
    if (amount > record.pendingAmount) {
      return res.status(400).json({ message: `Cannot receive more than pending amount (Rs. ${record.pendingAmount})` });
    }

    // Create payment entry
    const payment = new ShopPayment({
      salesRecordId,
      shopName: record.shopName,
      amount,
      mode,
      txnId: txnId || '',
      remarks: remarks || '',
      sellerId: seller._id,
      managerId: record.managerId,
      paymentPhoto: paymentPhoto || null
    });
    await payment.save();

    // Update Sales Record
    record.paidAmount = (record.paidAmount || 0) + amount;
    record.pendingAmount = (record.totalAmount || 0) - record.paidAmount;
    
    // Update status based on updated amounts
    if (record.pendingAmount <= 0) {
      record.paymentStatus = 'Paid';
    } else if (record.paidAmount > 0) {
      record.paymentStatus = 'Partial';
    } else {
      record.paymentStatus = 'Pending';
    }

    await record.save();

    // Create notification for Manager
    const notification = new Notification({
      managerId: record.managerId,
      title: 'New Payment Collected',
      message: `Payment of Rs. ${amount} received from ${record.shopName} via ${mode}.`,
      type: 'payment',
      data: {
        shopName: record.shopName,
        amount,
        mode,
        sellerName: seller.name,
        txnId: txnId || ''
      }
    });
    await notification.save();

    res.status(201).json({ message: 'Payment received successfully', payment, record });
  } catch (error) {
    console.error('Error receiving payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ============================================
// MANAGER ROUTES
// ============================================

// GET /api/shoppayments/manager-recent
// Get recent collections and summary stats for Manager Dashboard
router.get('/manager-recent', authMiddleware, roleMiddleware('manager'), async (req, res) => {
  try {
    const managerId = req.user._id;

    // Get 20 most recent payments
    const recentPayments = await ShopPayment.find({ managerId })
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .limit(managerRecentPaymentsLimit);

    // Calculate total collections (all time, or we can filter by month. Let's do all time matching the summary logic)
    const allPayments = await ShopPayment.find({ managerId });
    
    let cashCollection = 0;
    let onlineCollection = 0;
    
    allPayments.forEach(p => {
      if (p.mode === 'Cash') {
        cashCollection += p.amount;
      } else {
        onlineCollection += p.amount;
      }
    });

    const totalCollection = cashCollection + onlineCollection;

    // Calculate total pending from all sales records for this manager
    const allRecords = await SalesRecord.find({ managerId });
    const pendingCollection = allRecords.reduce((sum, r) => sum + (r.pendingAmount || 0), 0);

    res.json({
      recentPayments,
      stats: {
        totalCollection,
        cashCollection,
        onlineCollection,
        pendingCollection
      }
    });
  } catch (error) {
    console.error('Error fetching manager recent payments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/shoppayments/manager-collections
// Get all collections with pagination
router.get('/manager-collections', authMiddleware, roleMiddleware('manager'), async (req, res) => {
  try {
    const managerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || managerCollectionsPageSize;
    const skip = (page - 1) * limit;

    const total = await ShopPayment.countDocuments({ managerId });
    const collections = await ShopPayment.find({ managerId })
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      collections,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching manager collections:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/shoppayments/notifications
// Get unread notifications for Manager
router.get('/notifications', authMiddleware, roleMiddleware('manager'), async (req, res) => {
  try {
    const managerId = req.user._id;
    const notifications = await Notification.find({ managerId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const unreadCount = await Notification.countDocuments({ managerId, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT /api/shoppayments/notifications/read
// Mark notifications as read
router.put('/notifications/read', authMiddleware, roleMiddleware('manager'), async (req, res) => {
  try {
    const managerId = req.user._id;
    await Notification.updateMany({ managerId, read: false }, { read: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
