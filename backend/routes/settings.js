const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.use(auth, role('admin'));

const sanitizeSettings = (settings) => {
  const obj = settings.toObject ? settings.toObject() : { ...settings };
  obj.paymentKeySecret = obj.paymentKeySecret ? '********' : '';
  return obj;
};

// Get current settings (create defaults if missing)
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(sanitizeSettings(settings));
  } catch (err) {
    next(err);
  }
});

// Update settings
router.put('/', async (req, res, next) => {
  try {
    const update = { ...(req.body || {}) };
    if (update.paymentKeySecret === '********' || update.paymentKeySecret === '') {
      delete update.paymentKeySecret;
    }
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(update);
    } else {
      Object.assign(settings, update);
      await settings.save();
    }
    res.json(sanitizeSettings(settings));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
