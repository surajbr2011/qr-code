const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        try {
            const qr = await QRCode.findOne({ tableId: 'T-001' });
            if (qr) {
                console.log('TOKEN_FOUND: ' + qr.qrToken);
            } else {
                // Try any
                const anyQr = await QRCode.findOne();
                if (anyQr) {
                    console.log('TOKEN_FOUND: ' + anyQr.qrToken);
                } else {
                    console.log('NO_TOKENS_FOUND');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
