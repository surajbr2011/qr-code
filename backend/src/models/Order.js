const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be null for "Guest" orders
    },
    guestInfo: { // Basic info if not logged in
        name: String,
        phone: String,
        email: String
    },
    tableNo: {
        type: String,
        required: true
    },
    items: [
        {
            menuItem: {
                type: String, // Explicitly String
                required: false
            },
            name: String, // Store snapshot of name
            price: Number, // Store snapshot of price
            qty: { type: Number, required: true },
            category: String
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    promoCode: {
        type: String,
        default: ""
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirm', 'preparing', 'ready', 'ontheway', 'delivered', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'cod', 'card', 'cash', 'pending'],
        default: 'pending'
    },
    paymentDetails: {
        razorpay_order_id: String,
        razorpay_payment_id: String,
        razorpay_signature: String
    },
    staff: { // Who handled it?
        type: String
    },
    offerApplied: {
        id: String,
        title: String,
        discount: Number
    }
}, {
    timestamps: true,
    strict: false // Allow flexible data for debugging purposes
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
