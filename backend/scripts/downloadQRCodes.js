const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function downloadQRCodes() {
    try {
        console.log('📥 Downloading QR Codes...\n');

        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db');
        console.log('✅ Connected to MongoDB\n');

        const qrs = await QRCode.find();

        if (qrs.length === 0) {
            console.log('❌ No QR codes found. Run generateQRCodes.js first.');
            process.exit(1);
        }

        // Create directory for QR codes
        const qrDir = path.join(__dirname, '../qr-codes');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir);
        }

        console.log(`Found ${qrs.length} QR codes. Downloading...\n`);

        for (const qr of qrs) {
            try {
                // Extract base64 data
                const base64Data = qr.qrCodeUrl.replace(/^data:image\/png;base64,/, '');

                // Save to file
                const filename = `${qr.tableId}_${qr.metadata.tableName.replace(/\s+/g, '_')}.png`;
                const filepath = path.join(qrDir, filename);

                fs.writeFileSync(filepath, base64Data, 'base64');

                console.log(`✅ ${filename}`);
            } catch (err) {
                console.error(`❌ Failed to save ${qr.tableId}:`, err.message);
            }
        }

        console.log(`\n✅ All QR codes saved to: ${qrDir}`);
        console.log('\n📋 Next steps:');
        console.log('1. Open the qr-codes folder');
        console.log('2. Print each QR code');
        console.log('3. Laminate them for durability');
        console.log('4. Place on corresponding tables\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

downloadQRCodes();
