const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        const qrs = await QRCode.find({});
        console.log("Found QR Codes for tables:", qrs.map(q => q.tableId));
        if (qrs.length > 0) {
            const testUrl = `http://localhost:3001?token=${encodeURIComponent(qrs[0].qrToken)}`;
            console.log("\nTEST URL:", testUrl);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
