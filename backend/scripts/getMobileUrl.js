const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        const qr = await QRCode.findOne({ tableId: 'T-001' });

        if (!qr) {
            console.log('No QR codes found');
            process.exit(1);
        }

        const baseUrl = process.env.CUSTOMER_FRONTEND_URL || 'http://192.168.1.6:3001';
        const testUrl = `${baseUrl}?token=${encodeURIComponent(qr.qrToken)}`;

        console.log('\n📱 MOBILE TEST URL:');
        console.log('═'.repeat(80));
        console.log(testUrl);
        console.log('═'.repeat(80));
        console.log('\n📋 Instructions:');
        console.log('1. Copy the URL above');
        console.log('2. Open on your phone browser');
        console.log('3. Should show login screen with Table T-001 info\n');

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
