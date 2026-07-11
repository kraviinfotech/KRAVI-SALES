console.log("Attendance routes loaded");


const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Attendance = require("../models/Attendance");
const Seller = require("../models/Seller");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const subscriptionMiddleware = require("../middleware/subscriptionMiddleware");

// Seller routes

// =====================================================
// CHECK IN
// POST /api/attendance/checkin
// =====================================================

router.post(
    "/checkin",
    authMiddleware,
    roleMiddleware("seller"),
    subscriptionMiddleware,
    [
        body("latitude").isFloat().withMessage("Latitude is required"),
        body("longitude").isFloat().withMessage("Longitude is required"),
        body("accuracy").optional().isFloat()
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {

            const seller = await Seller.findOne({
                userId: req.user._id
            }).select("_id managerId");

            if (!seller) {
                return res.status(404).json({
                    message: "Seller not found."
                });
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const existing = await Attendance.findOne({
                sellerId: seller._id,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            });

            if (existing) {
                return res.status(400).json({
                    message: "Already checked in today."
                });
            }

            const attendance = await Attendance.create({

                sellerId: seller._id,

                managerId: seller.managerId,

                date: new Date(),

                loginTime: new Date(),

                checkInLocation: {
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    accuracy: req.body.accuracy || null
                },

                status: "Checked In"

            });

            return res.status(201).json({

                message: "Checked In Successfully",

                attendance

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                message: "Server Error"

            });

        }

    }
);


// =====================================================
// CHECK OUT
// POST /api/attendance/checkout
// =====================================================

router.post(
    "/checkout",
    authMiddleware,
    roleMiddleware("seller"),
    subscriptionMiddleware,
    [
        body("latitude").isFloat(),
        body("longitude").isFloat(),
        body("accuracy").optional().isFloat()
    ],
    async (req, res) => {

        try {

            const seller = await Seller.findOne({
                userId: req.user._id
            }).select("_id");

            if (!seller) {
                return res.status(404).json({
                    message: "Seller not found."
                });
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const attendance = await Attendance.findOne({

                sellerId: seller._id,

                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }

            });

            if (!attendance) {

                return res.status(404).json({

                    message: "Check In first."

                });

            }

            if (attendance.logoutTime) {

                return res.status(400).json({

                    message: "Already checked out."

                });

            }

            attendance.logoutTime = new Date();

            attendance.checkOutLocation = {

                latitude: req.body.latitude,

                longitude: req.body.longitude,

                accuracy: req.body.accuracy || null

            };

            attendance.status = "Checked Out";

            attendance.totalWorkingHours =

                Number(

                    (

                        (attendance.logoutTime - attendance.loginTime)

                        /

                        1000

                        /

                        60

                        /

                        60

                    ).toFixed(2)

                );

            await attendance.save();

            return res.json({

                message: "Checked Out Successfully",

                attendance

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                message: "Server Error"

            });

        }

    }

);


// =====================================================
// TODAY STATUS
// GET /api/attendance/today
// =====================================================

router.get(
    "/today",
    authMiddleware,
    roleMiddleware("seller"),
    subscriptionMiddleware,

    async (req, res) => {

        try {

            const seller = await Seller.findOne({

                userId: req.user._id

            }).select("_id");

            if (!seller) {

                return res.status(404).json({

                    message: "Seller not found."

                });

            }

            const startOfDay = new Date();

            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();

            endOfDay.setHours(23, 59, 59, 999);

            const attendance = await Attendance.findOne({

                sellerId: seller._id,

                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }

            });

            return res.json({

                checkedIn: !!attendance,

                attendance

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                message: "Server Error"

            });

        }

    });


// =====================================================
// HISTORY
// GET /api/attendance/history
// =====================================================

router.get(
    "/history",
    authMiddleware,
    roleMiddleware("seller"),
    subscriptionMiddleware,
    async (req, res) => {

        try {

            const seller = await Seller.findOne({

                userId: req.user._id

            }).select("_id");

            if (!seller) {

                return res.status(404).json({

                    message: "Seller not found."

                });

            }

            const history = await Attendance.find({

                sellerId: seller._id

            })

                .sort({

                    date: -1

                });

            return res.json(history);

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                message: "Server Error"

            });

        }

    });


// ==========================================
// GET MANAGER ATTENDANCE
// GET /api/attendance/manager
// ==========================================












// ==========================================
// GET MANAGER ATTENDANCE
// GET /api/attendance/manager
// Supports:
// page
// limit
// search
// date
// ==========================================

router.get(
  "/manager",
  authMiddleware,
  roleMiddleware("manager"),

  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit) || 10, 1);
      const skip = (page - 1) * limit;

      const search = (req.query.search || "").trim();
      const date = req.query.date;

      // -----------------------------
      // Find manager sellers
      // -----------------------------
      const sellerQuery = {
        managerId: req.user._id
      };

      if (search) {
        sellerQuery.name = {
          $regex: search,
          $options: "i"
        };
      }

      const sellers = await Seller.find(sellerQuery)
        .select("_id name")
        .lean();

      const sellerMap = {};

      sellers.forEach((seller) => {
        sellerMap[seller._id.toString()] = seller.name;
      });

      const sellerIds = sellers.map((s) => s._id);

      // -----------------------------
      // Attendance Query
      // -----------------------------
      const attendanceQuery = {
        sellerId: { $in: sellerIds }
      };

      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        attendanceQuery.date = {
          $gte: start,
          $lte: end
        };
      }

      const totalRecords = await Attendance.countDocuments(attendanceQuery);

      const attendance = await Attendance.find(attendanceQuery)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const records = attendance.map((record) => ({
        _id: record._id,

        date: new Date(record.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }),

        sellerName:
          sellerMap[record.sellerId.toString()] || "Unknown",

        checkInTime: record.loginTime
          ? new Date(record.loginTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "--",

        checkOutTime: record.logoutTime
          ? new Date(record.logoutTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "--",

        totalHours:
          record.totalWorkingHours > 0
            ? `${record.totalWorkingHours.toFixed(2)} hrs`
            : "--",

        status: record.status
      }));

      res.json({
        records,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);


module.exports = router;