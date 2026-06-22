const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'seller'],
    required: true
  },
  managerScannerPhoto: {
    type: String,
    default: null
  },
  photo: {
    type: String,
    default: null
  },
  designation: {
    type: String,
    default: 'Manager'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionTier: {
    type: String,
    default: null
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  passwordUpdatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  failedAttempts: {
    type: Number,
    default: 0
  },
  lastFailedAttempt: {
    type: Date,
    default: null
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  loginHistory: [
    {
      success: { type: Boolean, required: true },
      date: { type: Date, default: Date.now },
      ip: { type: String, default: null },
      browser: { type: String, default: null },
      device: { type: String, default: null },
      reason: { type: String, default: null }
    }
  ],
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedVersion: {
    type: String,
    default: null
  },
  termsAcceptedAt: {
    type: Date,
    default: null
  },
  termsAcceptedIp: {
    type: String,
    default: null
  },
  termsAcceptedDevice: {
    type: String,
    default: null
  }
});

// Hash password before saving and track password update time
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordUpdatedAt = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
