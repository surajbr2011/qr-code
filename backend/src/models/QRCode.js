const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    tableId: {
        type: String,
        required: true,
        unique: true
    },
    roomId: {
        type: String
    },
    zone: {
        type: String,
        enum: ['indoor', 'outdoor', 'terrace', 'bar', 'lounge', 'vip'],
        default: 'indoor'
    },
    metadata: {
        tableName: String,
        capacity: Number,
        floor: String
    },
    qrToken: {
        type: String,
        required: true
    },
    qrCodeUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastScanned: {
        type: Date
    },
    scans: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
