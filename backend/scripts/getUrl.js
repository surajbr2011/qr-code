const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        const qr = await QRCode.findOne({ tableId: 'table-01' });

        if (!qr) {
            console.log('No QR codes found');
            process.exit(1);
        }

        const testUrl = `http://localhost:3001?token=${encodeURIComponent(qr.qrToken)}`;
        require('fs').writeFileSync('test_url.txt', testUrl);
        console.log("URL written to test_url.txt");

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
