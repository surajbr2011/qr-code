const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'payment', 'system', 'alert'],
        default: 'system'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        tableNo: String,
        ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
