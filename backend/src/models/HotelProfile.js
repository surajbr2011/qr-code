const mongoose = require('mongoose');

const hotelProfileSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'My Restaurant'
    },
    address: {
        type: String,
        required: true,
        default: '123 Food Street'
    },
    contactNumber: {
        type: String,
        required: true,
        default: '123-456-7890'
    },
    email: {
        type: String,
        required: true,
        default: 'info@restaurant.com'
    },
    // Identity Fields
    trinixId: {
        type: String,
        default: ''
    },
    outletId: {
        type: String,
        default: ''
    },
    ownerName: {
        type: String,
        default: ''
    },
    logoUrl: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        default: '$'
    },
    taxRate: {
        type: Number,
        default: 0
    },
    serviceCharge: {
        type: Number,
        default: 0
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        instagram: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },
    settings: {
        billSettings: {
            sendEBillQuick: { type: Boolean, default: true },
            sendEBillDineIn: { type: Boolean, default: false },
            sendPaymentLink: { type: Boolean, default: false },
            sendWhatsapp: { type: Boolean, default: false },
            sendSMS: { type: Boolean, default: false },
            showOutletName: { type: Boolean, default: true },
            quickBillKOT: { type: Boolean, default: false }
        },
        autoSync: { type: Boolean, default: true },
        syncInterval: { type: String, default: '15 Minutes' },
        printers: [{
            name: { type: String },
            type: { type: String }, // 'kot', 'bill'
            enabled: { type: Boolean, default: true }
        }]
    }
}, {
    timestamps: true
});

const HotelProfile = mongoose.model('HotelProfile', hotelProfileSchema);

module.exports = HotelProfile;
