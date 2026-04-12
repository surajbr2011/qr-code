const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    openingCash: {
        type: Number,
        required: true,
        default: 0
    },
    closingCash: {
        type: Number,
        default: 0
    },
    expectedCash: {
        type: Number,
        default: 0
    },
    cashSales: {
        type: Number,
        default: 0
    },
    onlineSales: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
