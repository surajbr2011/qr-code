const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    discount: {
        type: Number,
        required: true
    },
    promoCode: {
        type: String,
        required: false // Optional, links to a PromoCode
    },
    validUntil: {
        type: Date,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
