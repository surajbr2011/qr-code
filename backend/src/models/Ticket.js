const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: String }, // Storing formatted date for simplicity as per UI requirement, or use timestamps
    time: { type: String },
    description: { type: String, required: true },
    raisedBy: { type: String, required: true },
    status: { type: String, default: 'Open', enum: ['Open', 'Resolved'] },
    update: { type: String, default: 'Ticket Created' },
    messages: [{
        id: { type: String },
        from: { type: String }, // 'user' or 'agent'
        text: { type: String },
        time: { type: String }
    }]
}, {
    timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
