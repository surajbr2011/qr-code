const express = require('express');
const router = express.Router();
const QRCode = require('../src/models/QRCode');
const TableSession = require('../src/models/TableSession');
const QRCodeGenerator = require('./qrCodeGenerator');

// Admin: Generate QR code for a table
router.post('/generate', async (req, res) => {
    try {
        const { tableId, roomId, zone, metadata } = req.body;

        // Check if QR code already exists for this table
        let existingQR = await QRCode.findOne({ tableId });

        if (existingQR) {
            return res.status(400).json({
                message: 'QR code already exists for this table',
                qrCode: existingQR
            });
        }

        // Generate secure token
        const qrToken = QRCodeGenerator.generateToken({
            tableId,
            roomId,
            zone
        });

        // Generate QR code image
        const baseUrl = process.env.CUSTOMER_FRONTEND_URL || 'https://monumental-creponne-8e56ad.netlify.app';
        const qrCodeUrl = await QRCodeGenerator.generateQRImage(qrToken, baseUrl);

        // Save to database
        const qrCode = new QRCode({
            tableId,
            roomId,
            zone,
            qrToken,
            qrCodeUrl,
            metadata
        });

        await qrCode.save();

        res.json({
            message: 'QR code generated successfully',
            qrCode
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ message: 'Failed to generate QR code' });
    }
});

// Admin: Get all QR codes
router.get('/all', async (req, res) => {
    try {
        const qrCodes = await QRCode.find().sort({ tableId: 1 });
        res.json(qrCodes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch QR codes' });
    }
});

// Admin: Get QR code by table ID
router.get('/table/:tableId', async (req, res) => {
    try {
        const qrCode = await QRCode.findOne({ tableId: req.params.tableId });

        if (!qrCode) {
            return res.status(404).json({ message: 'QR code not found' });
        }

        res.json(qrCode);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch QR code' });
    }
});

// Admin: Regenerate QR code
router.post('/regenerate/:tableId', async (req, res) => {
    try {
        const qrCode = await QRCode.findOne({ tableId: req.params.tableId });

        if (!qrCode) {
            return res.status(404).json({ message: 'QR code not found' });
        }

        // Generate new token
        const qrToken = QRCodeGenerator.generateToken({
            tableId: qrCode.tableId,
            roomId: qrCode.roomId,
            zone: qrCode.zone
        });

        // Generate new QR image
        const baseUrl = process.env.CUSTOMER_FRONTEND_URL || ' http://localhost:5174';
        const qrCodeUrl = await QRCodeGenerator.generateQRImage(qrToken, baseUrl);

        // Update database
        qrCode.qrToken = qrToken;
        qrCode.qrCodeUrl = qrCodeUrl;
        qrCode.generatedAt = new Date();

        await qrCode.save();

        res.json({
            message: 'QR code regenerated successfully',
            qrCode
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to regenerate QR code' });
    }
});

// Admin: Delete QR code
router.delete('/:tableId', async (req, res) => {
    try {
        await QRCode.findOneAndDelete({ tableId: req.params.tableId });
        res.json({ message: 'QR code deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete QR code' });
    }
});

// Customer: Validate QR code token
router.post('/validate', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                valid: false,
                message: 'No token provided'
            });
        }

        // Validate token format
        const validation = QRCodeGenerator.validateToken(token);

        if (!validation.valid) {
            return res.status(400).json({
                valid: false,
                message: validation.error
            });
        }

        // Check if QR code exists in database
        const qrCode = await QRCode.findOne({ qrToken: token });

        if (!qrCode) {
            return res.status(404).json({
                valid: false,
                message: 'QR code not found'
            });
        }

        if (!qrCode.isActive) {
            return res.status(403).json({
                valid: false,
                message: 'QR code is disabled'
            });
        }

        // Check if table already has an active session
        const activeSession = await TableSession.findOne({
            tableId: qrCode.tableId,
            status: 'active'
        });

        // Update QR code usage stats
        qrCode.usageCount += 1;
        qrCode.lastScannedAt = new Date();
        await qrCode.save();

        res.json({
            valid: true,
            message: 'QR code is valid',
            data: {
                tableId: qrCode.tableId,
                roomId: qrCode.roomId,
                zone: qrCode.zone,
                metadata: qrCode.metadata,
                hasActiveSession: !!activeSession,
                qrCodeId: qrCode._id
            }
        });

    } catch (error) {
        console.error('Error validating QR code:', error);
        res.status(500).json({
            valid: false,
            message: 'Failed to validate QR code'
        });
    }
});

module.exports = router;
