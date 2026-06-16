const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// Admin-only plans CRUD
router.use(auth, role('admin'));

router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const p = new Plan(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create plan', error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const p = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ message: 'Plan not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update plan', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const p = await Plan.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete plan', error: err.message });
  }
});

module.exports = router;
