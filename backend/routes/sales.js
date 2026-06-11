const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SalesRecord = require('../models/SalesRecord');
const SaleItem = require('../models/SaleItem');
const Seller = require('../models/Seller');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes in this file for sellers only
router.use(authMiddleware, roleMiddleware('seller'));

// POST /api/sales/record -> Create sales record and items
router.post(
  '/record',
  [
    body('shopName').trim().notEmpty().withMessage('Shop name is required'),
    body('shopAddress').trim().notEmpty().withMessage('Shop address is required'),
    body('shopType').isIn(['Retail', 'Wholesale', 'Distributor', 'Other']).withMessage('Invalid shop type'),
    body('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
    body('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productName').trim().notEmpty().withMessage('Product name is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.rate').isFloat({ min: 0.01 }).withMessage('Rate must be greater than 0'),
    // New optional fields
    body('checkInTime').optional().isISO8601().toDate(),
    body('checkOutTime').optional().isISO8601().toDate(),
    body('paymentMethod').optional().isIn(['Online', 'Offline', 'None']).withMessage('Invalid payment method'),
    body('paidAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('pendingAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('paymentStatus').optional().isIn(['Paid', 'Partial', 'Pending']).withMessage('Invalid payment status')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shopName, shopAddress, landmark, shopType, latitude, longitude, items, paymentMethod, paidAmount, pendingAmount, paymentStatus } = req.body;

    try {
      // Find the seller profile of the logged-in user
      let seller = await Seller.findOne({ userId: req.user._id });
      if (!seller) {
        const user = await User.findById(req.user._id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        seller = new Seller({
          userId: user._id,
          name: user.name,
          mobile: user.mobile
        });
        await seller.save();
      }

      // Prepare items
      let totalAmount = 0;
      const itemsToSave = items.map(item => {
        const quantity = Number(item.quantity);
        const rate = Number(item.rate);
        const amount = Number((quantity * rate).toFixed(2));
        totalAmount += amount;
        return {
          productName: item.productName,
          quantity,
          rate,
          amount
        };
      });

      // Create SalesRecord
      const record = new SalesRecord({
        sellerId: seller._id,
        shopName,
        shopAddress,
        landmark: landmark || '',
        shopType,
        latitude,
        longitude,
        visitDatetime: new Date(),
        totalAmount: Number(totalAmount.toFixed(2)),
        paymentMethod: paymentMethod || 'None',
        paidAmount: paidAmount || 0,
        pendingAmount: pendingAmount || 0,
        paymentStatus: paymentStatus || 'Pending',
      });

      await record.save();

      // Save SaleItems with the reference record ID
      const savedItems = [];
      for (const item of itemsToSave) {
        const saleItem = new SaleItem({
          recordId: record._id,
          productName: item.productName,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        });
        await saleItem.save();
        savedItems.push(saleItem);
      }

      res.status(201).json({
        message: 'Sales record saved successfully',
        record,
        items: savedItems
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error saving sales record' });
    }
  }
);

// GET /api/sales/my-records -> Get logged-in seller's past records with items populated
router.get('/my-records', async (req, res) => {
  try {
    let seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      try {
        seller = new Seller({
          userId: user._id,
          name: user.name,
          mobile: user.mobile
        });
        await seller.save();
      } catch (sellerErr) {
        console.error('Failed to create seller profile:', sellerErr);
        return res.status(500).json({ message: 'Unable to create seller profile. Please contact support.' });
      }
    }

    // Find records for this seller, sort newest first
    const records = await SalesRecord.find({ sellerId: seller._id })
      .sort({ visitDatetime: -1 })
      .lean();

    // Populate items manually for each record
    const recordsWithItems = [];
    for (const record of records) {
      const items = await SaleItem.find({ recordId: record._id });
      recordsWithItems.push({
        ...record,
        items
      });
    }

    res.json(recordsWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving your records' });
  }
});

module.exports = router;
