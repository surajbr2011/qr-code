const mongoose = require('mongoose');
const QRCode = require('../src/models/QRCode');
const QRCodeGenerator = require('./qrCodeGenerator');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/restaurant-qr-db')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define your tables
const tables = [
    { tableId: 'T-001', zone: 'indoor', metadata: { tableName: 'Table 1', capacity: 4, floor: 'Ground' } },
    { tableId: 'T-002', zone: 'indoor', metadata: { tableName: 'Table 2', capacity: 2, floor: 'Ground' } },
    { tableId: 'T-003', zone: 'indoor', metadata: { tableName: 'Table 3', capacity: 4, floor: 'Ground' } },
    { tableId: 'T-004', zone: 'outdoor', metadata: { tableName: 'Table 4', capacity: 6, floor: 'Ground' } },
    { tableId: 'T-005', zone: 'outdoor', metadata: { tableName: 'Table 5', capacity: 4, floor: 'Ground' } },
    { tableId: 'T-006', zone: 'vip', roomId: 'VIP-001', metadata: { tableName: 'VIP Room 1', capacity: 8, floor: 'First' } },
    { tableId: 'T-007', zone: 'vip', roomId: 'VIP-002', metadata: { tableName: 'VIP Room 2', capacity: 6, floor: 'First' } },
    { tableId: 'T-008', zone: 'bar', metadata: { tableName: 'Bar Counter 1', capacity: 2, floor: 'Ground' } },
    { tableId: 'T-009', zone: 'bar', metadata: { tableName: 'Bar Counter 2', capacity: 2, floor: 'Ground' } },
    { tableId: 'T-010', zone: 'lounge', metadata: { tableName: 'Lounge Sofa 1', capacity: 4, floor: 'First' } },
];

async function generateAllQRCodes() {
    try {
        console.log('Starting QR code generation...\n');

        for (const table of tables) {
            // Check if already exists
            const existing = await QRCode.findOne({ tableId: table.tableId });

            if (existing) {
                console.log(`✓ QR code already exists for ${table.tableId}`);
                continue;
            }

            // Generate token
            const qrToken = QRCodeGenerator.generateToken(table);

            // Generate QR image
            const baseUrl = process.env.CUSTOMER_FRONTEND_URL || 'http://localhost:3001';
            const qrCodeUrl = await QRCodeGenerator.generateQRImage(qrToken, baseUrl);

            // Save to database
            const qrCode = new QRCode({
                ...table,
                qrToken,
                qrCodeUrl
            });

            await qrCode.save();

            console.log(`✓ Generated QR code for ${table.tableId} (${table.metadata.tableName})`);
        }

        console.log('\n✅ All QR codes generated successfully!');
        console.log(`\nTotal QR codes: ${tables.length}`);
        console.log('\nYou can now:');
        console.log('1. View QR codes in the Admin Dashboard');
        console.log('2. Download and print them');
        console.log('3. Place them on tables\n');

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

generateAllQRCodes();
