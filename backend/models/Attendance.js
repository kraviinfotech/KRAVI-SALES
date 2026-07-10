const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({

    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },

    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    loginTime: {
        type: Date,
        required: true
    },

    logoutTime: {
        type: Date,
        default: null
    },

    totalWorkingHours: {
        type: Number,
        default: 0
    },

    checkInLocation: {
        latitude: Number,
        longitude: Number,
        accuracy: Number
    },

    checkOutLocation: {
        latitude: Number,
        longitude: Number,
        accuracy: Number
    },

    status: {
        type: String,
        enum: ['Checked In', 'Checked Out'],
        default: 'Checked In'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Attendance', AttendanceSchema);