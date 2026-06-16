const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// List companies (admin only)
router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch companies', error: err.message });
  }
});

// Get single company
router.get('/:id', auth, role('admin'), async (req, res) => {
  try {
    const comp = await Company.findById(req.params.id);
    if (!comp) return res.status(404).json({ message: 'Company not found' });
    res.json(comp);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch company', error: err.message });
  }
});

// Create company
router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const payload = req.body;
    const comp = new Company(payload);
    await comp.save();
    res.status(201).json(comp);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create company', error: err.message });
  }
});

// Update company
router.patch('/:id', auth, role('admin'), async (req, res) => {
  try {
    const comp = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comp) return res.status(404).json({ message: 'Company not found' });
    res.json(comp);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update company', error: err.message });
  }
});

// Delete company
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const comp = await Company.findByIdAndDelete(req.params.id);
    if (!comp) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete company', error: err.message });
  }
});

module.exports = router;
