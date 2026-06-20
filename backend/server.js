require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const sellerRoutes = require('./routes/sellers');
const salesRoutes = require('./routes/sales');
const reportsRoutes = require('./routes/reports');
const productRoutes = require('./routes/products');
const settingsRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');
const plansRoutes = require('./routes/plans');
const paymentsRoutes = require('./routes/payments');
const subscriptionsRoutes = require('./routes/subscriptions');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An internal server error occurred'
  });
});

// Database Connection and Server Boot
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/salestracker';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
