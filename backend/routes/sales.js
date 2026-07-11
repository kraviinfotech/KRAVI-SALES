const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SalesRecord = require('../models/SalesRecord');
const SaleItem = require('../models/SaleItem');
const Seller = require('../models/Seller');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware');
const { attachItemsToRecords } = require('../utils/salesRecordUtils');
const upload = require('../utils/multerConfig');
const { uploadBuffer, uploadBase64ToAzure, resolveBlobUrl, getBlobNameFromUrl } = require('../utils/azureBlob');

// Protect all routes in this file for sellers only
router.use(authMiddleware, roleMiddleware('seller'), subscriptionMiddleware);

const findOrRepairSellerProfile = async (user) => {
  let seller = await Seller.findOne({ userId: user._id });

  if (seller?.managerId) {
    return seller;
  }

  const managers = await User.find({ role: 'manager' }).select('_id').sort({ createdAt: 1 }).limit(2);
  if (managers.length !== 1) {
    return seller;
  }

  const managerId = managers[0]._id;

  if (!seller) {
    seller = new Seller({
      userId: user._id,
      managerId,
      name: user.name,
      mobile: user.mobile,
      password: null
    });
  } else {
    seller.managerId = managerId;
  }

  await seller.save();
  return seller;
};

// POST /api/sales/record -> Create sales record and items
router.post(
  '/record',
  upload.fields([
    { name: 'shopImage', maxCount: 1 },
    { name: 'scannerPhoto', maxCount: 1 }
  ]),
  [
    body('shopName').trim().notEmpty().withMessage('Shop name is required'),
    body('shopAddress').trim().notEmpty().withMessage('Shop address is required'),
    body('mobile').optional().isString().withMessage('Invalid mobile number'),
    body('shopType').isIn(['Retail', 'Wholesale', 'Distributor', 'Other']).withMessage('Invalid shop type'),
    body('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
    body('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
    body('items').custom((items, { req }) => {
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
          req.body.items = items;
        } catch (err) {
          throw new Error('Items must be valid JSON');
        }
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('At least one item is required');
      }

      items.forEach((item) => {
        const unit = item.unit || 'quantity';
        const price = Number(item.price ?? item.rate);

        if (!String(item.productName || '').trim()) {
          throw new Error('Product name is required');
        }

        if (!['quantity', 'weight'].includes(unit)) {
          throw new Error('Unit must be quantity or weight');
        }

        if (!(price > 0)) {
          throw new Error('Price must be greater than 0');
        }

        if (unit === 'weight') {
          if (!(Number(item.weight) >= 0.1)) {
            throw new Error('Weight must be greater than 0.1');
          }
          return;
        }

        if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
          throw new Error('Quantity must be at least 1');
        }
      });

      return true;
    }),
    // New optional fields
    body('checkInTime').optional().isISO8601().toDate(),
    body('checkOutTime').optional().isISO8601().toDate(),
    body('paymentMethod').optional().isIn(['Online', 'Offline']).withMessage('Invalid payment method'),
    body('paidAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('pendingAmount').optional().isFloat({ min: 0 }).toFloat(),
    body('paymentStatus').optional().isIn(['Paid', 'Partial', 'Pending']).withMessage('Invalid payment status')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {
      shopName,
      shopAddress,
      mobile,
      landmark,
      shopType,
      latitude,
      longitude,
      items,
      paymentMethod,
      paidAmount,
      pendingAmount,
      paymentStatus,
      scannerPhoto,
      shopImage
    } = req.body;

    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid items format"
        });
      }
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "Items must be an array"
      });
    }
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

      // Upload images directly with Multer file buffers, or resolve an existing blob URL
      const shopImageFile = req.files?.shopImage?.[0] || null;
      const scannerPhotoFile = req.files?.scannerPhoto?.[0] || null;
      const shopImageValue = req.body.shopImage;
      const scannerPhotoValue = req.body.scannerPhoto;

      const uploadedShopImage = shopImageFile
        ? await uploadBuffer(shopImageFile.buffer, shopImageFile.originalname, shopImageFile.mimetype)
        : typeof shopImageValue === 'string' && shopImageValue.startsWith('data:')
          ? await uploadBase64ToAzure(shopImageValue, 'shop-image')
          : getBlobNameFromUrl(shopImageValue) || null;

      const uploadedScannerPhoto = scannerPhotoFile
        ? await uploadBuffer(scannerPhotoFile.buffer, scannerPhotoFile.originalname, scannerPhotoFile.mimetype)
        : typeof scannerPhotoValue === 'string' && scannerPhotoValue.startsWith('data:')
          ? await uploadBase64ToAzure(scannerPhotoValue, 'scanner-photo')
          : getBlobNameFromUrl(scannerPhotoValue) || null;

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
        scannerPhoto: uploadedScannerPhoto || null,
        shopImage: uploadedShopImage || null
      });

      await record.save();

      // Save SaleItems with the reference record ID
      const savedItems = await Promise.all(itemsToSave.map(async (item) => {
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
        return saleItem;
      }));

      const savedRecord = record.toObject();
      savedRecord.shopImage = resolveBlobUrl(savedRecord.shopImage);
      savedRecord.scannerPhoto = resolveBlobUrl(savedRecord.scannerPhoto);

      res.status(201).json({
        message: 'Sales record saved successfully',
        record: savedRecord,
        items: savedItems
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error saving sales record' });
    }
  }
);

// GET /api/sales/today-stats -> Lightweight today summary for seller dashboard
router.get('/today-stats', async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id }).select('_id managerId');

    if (!seller || !seller.managerId) {
      return res.status(403).json({
        message: 'Seller profile not found or not associated with a manager'
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayRecords = await SalesRecord.find({
      sellerId: seller._id,
      managerId: seller.managerId,
      visitDatetime: { $gte: startOfDay, $lte: endOfDay }
    })
      .select('totalAmount')
      .lean();

    const recordIds = todayRecords.map((record) => record._id);
    const items = recordIds.length
      ? await SaleItem.find({ recordId: { $in: recordIds } })
        .select('recordId unit quantity weight')
        .lean()
      : [];

    const itemsSold = items.reduce((sum, item) => {
      if (item.unit === 'weight') return sum + 1;
      return sum + Number(item.quantity || 0);
    }, 0);

    res.json({
      visits: todayRecords.length,
      sales: todayRecords.reduce((sum, record) => sum + Number(record.totalAmount || 0), 0),
      items: itemsSold
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving today stats' });
  }
});

// GET /api/sales/my-records -> Get logged-in seller's past records with items populated
router.get('/my-records', async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id }).select('_id managerId');

    if (!seller || !seller.managerId) {
      return res.status(403).json({
        message: 'Seller profile not found or not associated with a manager'
      });
    }

    const lite = req.query.lite === '1' || req.query.lite === 'true';
    const projection = lite ? '-scannerPhoto -shopImage' : '-scannerPhoto';

    const records = await SalesRecord.find({ sellerId: seller._id, managerId: seller.managerId })
      .select(projection)
      .sort({ visitDatetime: -1 })
      .lean();

    const recordsWithItems = await attachItemsToRecords(records);
    const recordsWithUrls = recordsWithItems.map((record) => ({
      ...record,
      shopImage: resolveBlobUrl(record.shopImage),
      scannerPhoto: resolveBlobUrl(record.scannerPhoto)
    }));

    res.json(recordsWithUrls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving your records' });
  }
});

module.exports = router;
