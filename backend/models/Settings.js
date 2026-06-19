const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  appName: { type: String, default: 'KRAVI SaaS' },
  trialDays: { type: Number, default: 14 },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: String, default: '' },
  smtpUser: { type: String, default: '' },
  paymentKeyId: { type: String, default: '' },
  paymentKeySecret: { type: String, default: '' },
  notifications: {
    subscriptionExpiring: { type: Boolean, default: true },
    newPaymentReceived: { type: Boolean, default: true },
    trialPeriodEnding: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
