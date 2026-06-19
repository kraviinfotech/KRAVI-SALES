const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getPlanDurationDays, getPlanSellerLimit } = require('../utils/subscriptionUtils');

// Admin-only plans CRUD
router.use(auth, role('admin'));

router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans.map(plan => {
      const obj = plan.toObject();
      obj.durationDays = getPlanDurationDays(obj);
      obj.maxSellers = getPlanSellerLimit(obj);
      return obj;
    }));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans', error: err.message });
  }
});

const planValidators = (partial = false) => [
  partial
    ? body('name').optional().trim().notEmpty().withMessage('Plan name is required')
    : body('name').trim().notEmpty().withMessage('Plan name is required'),
  partial
    ? body('price').optional().isFloat({ min: 0 }).withMessage('Price must be zero or greater')
    : body('price').isFloat({ min: 0 }).withMessage('Price must be zero or greater'),
  body('durationMonths').optional().isFloat({ min: 0 }).withMessage('Duration months must be zero or greater'),
  body('durationDays').optional().isInt({ min: 0 }).withMessage('Duration days must be zero or greater'),
  body('maxSellers').optional().isInt({ min: 0 }).withMessage('Seller limit must be zero or greater'),
  body('isActive').optional().isBoolean(),
  body('isTrial').optional().isBoolean()
];

router.post('/', planValidators(false), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const payload = {
      ...req.body,
      durationDays: Number(req.body.durationDays) || (Number(req.body.durationMonths || 0) * 30),
      maxSellers: Number(req.body.maxSellers || req.body.managers || 0)
    };
    const p = new Plan(payload);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create plan', error: err.message });
  }
});

router.patch('/:id', planValidators(true), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const payload = { ...req.body };
    if (payload.durationMonths !== undefined && payload.durationDays === undefined) {
      payload.durationDays = Number(payload.durationMonths || 0) * 30;
    }
    if (payload.managers !== undefined && payload.maxSellers === undefined) {
      payload.maxSellers = Number(payload.managers || 0);
    }
    const p = await Plan.findByIdAndUpdate(req.params.id, payload, { new: true });
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
