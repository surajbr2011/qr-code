const mongoose = require('mongoose');

const tableSessionSchema = new mongoose.Schema({
    tableId: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    customer: {
        name: String,
        phone: String,
        email: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TableSession', tableSessionSchema);
