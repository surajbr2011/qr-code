const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: String, // Or mongoose.Schema.Types.ObjectId if referencing users, but simple string is fine for now as per UI
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
