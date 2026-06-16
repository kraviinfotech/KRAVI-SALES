const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get current settings (create defaults if missing)
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// Update settings
router.put('/', async (req, res, next) => {
  try {
    const update = req.body || {};
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(update);
    } else {
      Object.assign(settings, update);
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
