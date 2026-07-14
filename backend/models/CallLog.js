const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    role: {
      type: String,
      enum: ['seller', 'manager', 'admin'],
    },
  },
  { _id: false }
);

const CallLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    caller: {
      type: participantSchema,
      required: true,
    },
    receiver: {
      type: participantSchema,
      required: true,
    },
    callType: {
      type: String,
      enum: ['voice', 'video', 'screen'],
      default: 'voice',
    },
    status: {
      type: String,
      enum: ['completed', 'missed', 'rejected', 'failed'],
      default: 'missed',
    },
    startedAt: Date,
    endedAt: Date,
    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CallLogSchema.index({ tenantId: 1, 'caller.userId': 1, createdAt: -1 });
CallLogSchema.index({ tenantId: 1, 'receiver.userId': 1, createdAt: -1 });

module.exports = mongoose.model('CallLog', CallLogSchema);
