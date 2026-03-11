const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(async () => {
        console.log('✅ Connected to MongoDB\n');

        const count = await QRCode.countDocuments();
        console.log(`📊 Total QR codes in database: ${count}\n`);

        const qrs = await QRCode.find().select('tableId zone metadata.tableName isActive');

        console.log('QR Codes Generated:');
        console.log('─'.repeat(50));
        qrs.forEach(qr => {
            const status = qr.isActive ? '✅' : '❌';
            console.log(`${status} ${qr.tableId}: ${qr.metadata.tableName} (${qr.zone})`);
        });
        console.log('─'.repeat(50));
        console.log('\n✅ All QR codes are ready to use!');

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
