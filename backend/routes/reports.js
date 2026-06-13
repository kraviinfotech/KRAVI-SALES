const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SalesRecord = require('../models/SalesRecord');
const SaleItem = require('../models/SaleItem');
const Seller = require('../models/Seller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all routes under this router for manager role only
router.use(authMiddleware, roleMiddleware('manager'));

// DELETE /api/reports/clear-all -> सभी सेल्स रिकॉर्ड और आइटम्स डिलीट करें (सिर्फ Manager के लिए)
router.delete('/clear-all', async (req, res) => {
  try {
    await SalesRecord.deleteMany({});
    await SaleItem.deleteMany({});
    res.json({ message: 'All sales records and items have been deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting records' });
  }
});

// DELETE /api/reports/seller-records/:sellerId -> Remove all records for a specific seller
router.delete('/seller-records/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    const recordsToDelete = await SalesRecord.find({ sellerId }, '_id');
    const ids = recordsToDelete.map(r => r._id);

    if (ids.length === 0) {
      return res.json({ message: 'No records found for this seller.' });
    }

    await SalesRecord.deleteMany({ _id: { $in: ids } });
    await SaleItem.deleteMany({ recordId: { $in: ids } });

    res.json({ message: `Successfully removed ${ids.length} records for the seller.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting seller records' });
  }
});

// DELETE /api/reports/purge-unknown -> Remove records belonging to deleted/unknown sellers
router.delete('/purge-unknown', async (req, res) => {
  try {
    const activeSellers = await Seller.find({}, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);

    const orphanedRecords = await SalesRecord.find({
      $or: [
        { sellerId: { $nin: activeSellerIds } },
        { sellerId: { $exists: false } },
        { sellerId: null }
      ]
    }, '_id');

    const orphanedIds = orphanedRecords.map(r => r._id);

    if (orphanedIds.length === 0) {
      return res.json({ message: 'No orphaned records found.' });
    }

    await SalesRecord.deleteMany({ _id: { $in: orphanedIds } });
    await SaleItem.deleteMany({ recordId: { $in: orphanedIds } });

    res.json({ message: `Successfully removed ${orphanedIds.length} records of unknown sellers.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while purging unknown records' });
  }
});

// GET /api/reports/summary -> Returns totalSellers, totalRecords, monthlyTotal, yearlyTotal
router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const activeSellers = await Seller.find({ managerId: req.user._id }, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);
    const activeMatch = { sellerId: { $in: activeSellerIds } };

    const totalSellers = activeSellers.length;
    const totalRecords = await SalesRecord.countDocuments(activeMatch);

    const monthlySales = await SalesRecord.aggregate([
      { $match: { ...activeMatch, visitDatetime: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const yearlySales = await SalesRecord.aggregate([
      { $match: { ...activeMatch, visitDatetime: { $gte: startOfYear } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingSales = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
    ]);

    res.json({
      totalSellers,
      totalRecords,
      monthlyTotal: monthlySales[0]?.total || 0,
      yearlyTotal: yearlySales[0]?.total || 0,
      totalPending: pendingSales[0]?.total || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving summary' });
  }
});


// GET /api/reports/weekly -> Group sales by day for the last 7 days
router.get('/weekly', async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push(d);
    }

    const activeSellers = await Seller.find({}, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);
    const activeMatch = { sellerId: { $in: activeSellerIds } };

    const startOfWeek = last7Days[0];
    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklySales = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id), visitDatetime: { $gte: startOfWeek, $lte: endOfWeek } } },
      { $match: { ...activeMatch, visitDatetime: { $gte: startOfWeek, $lte: endOfWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDatetime', timezone: 'UTC' } },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const weeklyData = last7Days.map(date => {
      // Find matching date ignoring timezone offset mismatch by slicing ISO format
      const dateStr = date.toISOString().split('T')[0];
      // Search in aggregates
      const found = weeklySales.find(item => item._id === dateStr);
      return {
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: found ? Number(found.total.toFixed(2)) : 0
      };
    });

    res.json(weeklyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving weekly report' });
  }
});

// GET /api/reports/monthly?month=&year= -> Group sales by day of month
router.get('/monthly', async (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1); // 1-12
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const activeSellers = await Seller.find({}, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);
    const activeMatch = { sellerId: { $in: activeSellerIds } };

    const monthlySales = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id), visitDatetime: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $match: { ...activeMatch, visitDatetime: { $gte: startOfMonth, $lte: endOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDatetime', timezone: 'UTC' } },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthlyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const found = monthlySales.find(item => item._id === dateStr);
      monthlyData.push({
        date: dateStr,
        day: String(day),
        total: found ? Number(found.total.toFixed(2)) : 0
      });
    }

    res.json(monthlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving monthly report' });
  }
});

// GET /api/reports/today - Total sales for today
router.get('/today', async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const activeSellers = await Seller.find({}, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);
    const activeMatch = { sellerId: { $in: activeSellerIds } };

    const result = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id), visitDatetime: { $gte: start, $lte: end } } },
      { $match: { ...activeMatch, visitDatetime: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    res.json({ totalSales: Number((result[0]?.totalSales || 0).toFixed(2)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving today sales' });
  }
});

// GET /api/reports/shop-wise - Sales aggregated by shop name
router.get('/shop-wise', async (req, res) => {
  try {
    const activeSellers = await Seller.find({}, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);
    const activeMatch = { sellerId: { $in: activeSellerIds } };

    const data = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id) } },
      { $match: activeMatch },
      { $group: { _id: '$shopName', totalSales: { $sum: '$totalAmount' }, visits: { $sum: 1 } } },
      { $project: { shopName: '$_id', totalSales: { $round: ['$totalSales', 2] }, visits: 1, _id: 0 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving shop-wise report' });
  }
});

// GET /api/reports/product-wise - Product sales aggregation
router.get('/product-wise', async (req, res) => {
  try {
    const data = await SaleItem.aggregate([
      {
        $lookup: {
          from: 'salesrecords',
          localField: 'recordId',
          foreignField: '_id',
          as: 'record'
        }
      },
      { $unwind: '$record' },
      { $match: { 'record.managerId': new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$productName', totalQty: { $sum: '$quantity' }, totalRevenue: { $sum: { $multiply: ['$quantity', '$rate'] } } } },
      { $project: { productName: '$_id', quantitySold: '$totalQty', revenue: { $round: ['$totalRevenue', 2] }, _id: 0 } },
      { $sort: { revenue: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving product-wise report' });
  }
});

// GET /api/reports/location - List of shop locations with coordinates
router.get('/location', async (req, res) => {
  try {
    const records = await SalesRecord.find({ managerId: req.user._id }, 'shopName latitude longitude shopAddress').lean();
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving location data' });
  }
});

// GET /api/reports/payments - Summary of payment statuses
router.get('/payments', async (req, res) => {
  try {
    const data = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$paymentStatus', totalPaid: { $sum: '$paidAmount' }, totalPending: { $sum: '$pendingAmount' } } },
      { $project: { status: '$_id', totalPaid: { $round: ['$totalPaid', 2] }, totalPending: { $round: ['$totalPending', 2] }, _id: 0 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving payment report' });
  }
});

// GET /api/reports/target-achievement - Compare seller monthly target vs actual sales
router.get('/target-achievement', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const sellers = await Seller.find({ managerId: req.user._id }).lean();
    const results = [];
    for (const seller of sellers) {
      const sales = await SalesRecord.aggregate([
        { $match: { sellerId: seller._id, visitDatetime: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const actual = Number((sales[0]?.total || 0).toFixed(2));
      const target = seller.monthlyTarget || 0;
      const achievement = target ? (actual / target) * 100 : 0;
      results.push({ sellerId: seller._id, sellerName: seller.name, target, actual, achievementPercent: Number(achievement.toFixed(2)) });
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving target achievement' });
  }
});

// GET /api/reports/attendance - Fetch attendance records (optional query by seller)
router.get('/attendance', async (req, res) => {
  try {
    const { sellerId } = req.query;
    const query = {};
    if (sellerId) query.sellerId = sellerId;
    
    // Safe check for model existence to prevent 500 error
    let Attendance;
    try { Attendance = require('../models/Attendance'); } catch (e) {
      return res.status(501).json({ message: 'Attendance module not implemented' });
    }

    // Filter attendance by manager's sellers
    const managerSellers = await Seller.find({ managerId: req.user._id }).select('_id');
    const sellerIds = managerSellers.map(s => s._id);
    query.sellerId = query.sellerId ? { $and: [{ $eq: query.sellerId }, { $in: sellerIds }] } : { $in: sellerIds };

    const records = await Attendance.find(query).sort({ date: -1 }).lean();
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving attendance data' });
  }
});

// GET /api/reports/yearly?year= -> Group sales by month of year
router.get('/yearly', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const activeSellers = await Seller.find({}, '_id');
    const activeSellerIds = activeSellers.map(s => s._id);
    const activeMatch = { sellerId: { $in: activeSellerIds } };

    const yearlySales = await SalesRecord.aggregate([
      { $match: { managerId: new mongoose.Types.ObjectId(req.user._id), visitDatetime: { $gte: startOfYear, $lte: endOfYear } } },
      { $match: { ...activeMatch, visitDatetime: { $gte: startOfYear, $lte: endOfYear } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$visitDatetime', timezone: 'UTC' } },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearlyData = months.map((monthName, idx) => {
      const monthKey = `${year}-${String(idx + 1).padStart(2, '0')}`;
      const found = yearlySales.find(item => item._id === monthKey);
      return {
        month: monthName,
        total: found ? Number(found.total.toFixed(2)) : 0
      };
    });

    res.json(yearlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving yearly report' });
  }
});

// GET /api/reports/sellers-performance -> Aggregate seller performance metrics
router.get('/sellers-performance', async (req, res) => {
  try {
    const sellers = await Seller.find({ managerId: req.user._id }).lean();
    const performanceData = [];

    for (const seller of sellers) {
      const records = await SalesRecord.find({ sellerId: seller._id }).lean();
      const recordIds = records.map(r => r._id);
      
      let itemsSold = 0;
      if (recordIds.length > 0) {
        const itemAggregate = await SaleItem.aggregate([
          { $match: { recordId: { $in: recordIds } } },
          { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
        ]);
        itemsSold = itemAggregate.length > 0 ? itemAggregate[0].totalQty : 0;
      }

      const totalSales = records.reduce((sum, r) => sum + r.totalAmount, 0);

      performanceData.push({
        id: seller._id,
        name: seller.name,
        mobile: seller.mobile,
        recordCount: records.length,
        shopsVisited: records.length, // Each record corresponds to one shop visit
        itemsSold,
        totalSales: Number(totalSales.toFixed(2))
      });
    }

    res.json(performanceData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving seller performance' });
  }
});

// GET /api/reports/records?sellerId=&from=&to=&shopType= -> Get filtered records list with items
router.get('/records', async (req, res) => {
  try {
    const { sellerId, from, to, shopType, shopName, status, sellerName } = req.query;
    const query = { managerId: req.user._id };

    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      query.sellerId = sellerId;
    }
    
    if (sellerName) {
      const matchingSellers = await Seller.find({ 
        managerId: req.user._id, 
        name: { $regex: sellerName, $options: 'i' } 
      }).select('_id');
      const sellerIds = matchingSellers.map(s => s._id);
      query.sellerId = { $in: sellerIds };
    }

    if (shopType) {
      query.shopType = shopType;
    }

    if (shopName) {
      query.shopName = { $regex: shopName.trim(), $options: 'i' };
    }

    if (status) {
      query.paymentStatus = status; // Matches 'Paid', 'Partial', 'Pending'
    }

    if (from || to) {
      query.visitDatetime = {};
      if (from) {
        query.visitDatetime.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.visitDatetime.$lte = toDate;
      }
    }

    // Populate the Seller information
    const records = await SalesRecord.find(query)
      .populate('sellerId', 'name mobile')
      .sort({ visitDatetime: -1 })
      .lean();

    // Fetch and append SaleItems for each SalesRecord
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
    res.status(500).json({ message: 'Server error retrieving reports records list' });
  }
});

module.exports = router;
