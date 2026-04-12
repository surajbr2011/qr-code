const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String // URL to image
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    veg: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
