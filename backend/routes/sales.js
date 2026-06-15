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
    body('mobile').optional().isString().withMessage('Invalid mobile number'),
    body('shopType').isIn(['Retail', 'Wholesale', 'Distributor', 'Other']).withMessage('Invalid shop type'),
    body('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
    body('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productName').trim().notEmpty().withMessage('Product name is required'),
    body('items.*.unit').optional().isIn(['quantity', 'weight']).withMessage('Unit must be quantity or weight'),
    body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.weight').optional().isFloat({ min: 0.1 }).withMessage('Weight must be greater than 0.1'),
    body('items.*.price').optional().isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('items.*.rate').optional().isFloat({ min: 0.01 }).withMessage('Rate must be greater than 0'),
    // New optional fields
    body('checkInTime').optional().isISO8601().toDate(),
    body('checkOutTime').optional().isISO8601().toDate(),
    body('paymentMethod').optional().isIn(['Online', 'Offline']).withMessage('Invalid payment method'),
    body('paidAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('pendingAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('paymentStatus').optional().isIn(['Paid', 'Partial', 'Pending']).withMessage('Invalid payment status'),
    body('scannerPhoto').optional().isString().withMessage('Scanner photo must be a string')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shopName, shopAddress, mobile, landmark, shopType, latitude, longitude, items, paymentMethod, paidAmount, pendingAmount, paymentStatus, scannerPhoto } = req.body;

    try {
      // Find the seller profile of the logged-in user
      const seller = await Seller.findOne({ userId: req.user._id }).select('_id managerId');

      // Enforce multi-tenancy: Sellers must belong to a manager
      if (!seller || !seller.managerId) {
        return res.status(403).json({ 
          message: 'Seller profile not found or not associated with a manager. Please contact your manager.' 
        });
      }

      // Capture managerId from seller profile for easier manager-specific reporting
      const managerId = seller.managerId;

      // Prepare items - handle both new (unit/weight/price) and old (quantity/rate) structures
      let totalAmount = 0;
      const itemsToSave = items.map(item => {
        let quantity, rate, amount;
        
        if (item.unit === 'weight') {
          // New weight-based structure
          quantity = Number(item.weight) || 1;
          rate = Number(item.price) || 0;
        } else {
          // New quantity-based structure or old structure
          quantity = Number(item.quantity) || 1;
          rate = Number(item.price || item.rate) || 0;
        }
        
        amount = Number((quantity * rate).toFixed(2));
        totalAmount += amount;
        
        return {
          productName: item.productName,
          unit: item.unit || 'quantity',
          quantity: item.unit === 'weight' ? item.weight : item.quantity,
          weight: item.unit === 'weight' ? item.weight : undefined,
          price: item.price || item.rate,
          rate: item.price || item.rate,
          amount
        };
      });

      // Create SalesRecord
      const record = new SalesRecord({
        sellerId: seller._id,
        managerId: managerId, // Link record to the manager who owns the seller
        shopName,
        mobile: mobile || '',
        shopAddress,
        landmark: landmark || '',
        shopType,
        latitude,
        longitude,
        visitDatetime: new Date(),
        totalAmount: Number(totalAmount.toFixed(2)),
        paymentMethod: paymentMethod || 'Offline',
        paidAmount: paidAmount || 0,
        pendingAmount: pendingAmount || 0,
        paymentStatus: paymentStatus || 'Pending',
        scannerPhoto: scannerPhoto || null
      });

      await record.save();

      // Save SaleItems with the reference record ID
      const savedItems = [];
      for (const item of itemsToSave) {
        const saleItem = new SaleItem({
          recordId: record._id,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          weight: item.weight,
          price: item.price,
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
    const seller = await Seller.findOne({ userId: req.user._id }).select('_id managerId');

    if (!seller || !seller.managerId) {
      return res.status(403).json({
        message: 'Seller profile not found or not associated with a manager'
      });
    }

    // Find only records owned by the logged-in seller and their assigned manager.
    const records = await SalesRecord.find({ sellerId: seller._id, managerId: seller.managerId })
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
