const QRCode = require('../models/QRCode');
const QRCodeGenerator = require('../../scripts/qrCodeGenerator');
// Note: qrCodeGenerator is in scripts. We might want to move it to utils properly, but for now we require from scripts
// Actually, `../utils/qrCodeGenerator` would be better if we moved it. 
// But let's stick to where it is or move it.
// The user pasted it in scripts. Ideally it should be in utils.
// Let's assume for now we reference it from scripts or I can move it.
// To avoid path hell, let's assume I move it to utils?
// No, let's reference where it is: `../../scripts/qrCodeGenerator`
// Wait, `backend/src/controllers` -> `../../scripts` is `backend/scripts`. Correct.

const getQRCodes = async (req, res) => {
    try {
        const qrcodes = await QRCode.find({});
        res.json(qrcodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createQRCode = async (req, res) => {
    try {
        const { tableId, zone, tableName, capacity, floor } = req.body;

        const existing = await QRCode.findOne({ tableId });
        if (existing) {
            return res.status(400).json({ message: 'QR Code already exists for this Table ID' });
        }

        const payload = {
            tableId,
            zone: zone || 'indoor',
            metadata: {
                tableName: tableName || `Table ${tableId}`,
                capacity: capacity || 4,
                floor: floor || 'Ground'
            }
        };

        const qrToken = QRCodeGenerator.generateToken(payload);
        const baseUrl = process.env.CUSTOMER_FRONTEND_URL || 'http://localhost:3001';
        const qrCodeUrl = await QRCodeGenerator.generateQRImage(qrToken, baseUrl);

        const qrCode = await QRCode.create({
            tableId,
            zone: payload.zone,
            metadata: payload.metadata,
            qrToken,
            qrCodeUrl
        });

        res.status(201).json(qrCode);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteQRCode = async (req, res) => {
    try {
        const qrCode = await QRCode.findById(req.params.id);
        if (qrCode) {
            await qrCode.deleteOne();
            res.json({ message: 'QR Code removed' });
        } else {
            res.status(404).json({ message: 'QR Code not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyScan = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        // 1. Decode token
        const result = QRCodeGenerator.validateToken(token);
        if (!result.valid) {
            return res.status(400).json({ message: result.error });
        }

        // 2. Check if this specific token exists in DB and is active
        // This is crucial for regeneration logic: when a QR is regenerated, 
        // the old token is replaced in the DB, so the old token won't be found here.
        const qrCode = await QRCode.findOne({ qrToken: token, isActive: true });
        if (!qrCode) {
            return res.status(403).json({ message: 'This QR code has expired or been regenerated.' });
        }

        // Update scan stats
        qrCode.scans = (qrCode.scans || 0) + 1;
        qrCode.lastScanned = new Date();
        await qrCode.save();

        // Emit Socket Event
        const io = req.app.get('io');
        if (io) {
            io.emit('table:scanned', {
                tableId: qrCode.tableId,
                lastScanned: qrCode.lastScanned,
                tableName: qrCode.metadata?.tableName
            });
        }

        // Return table info
        res.json({
            valid: true,
            tableId: qrCode.tableId,
            roomId: qrCode.roomId,
            tableName: qrCode.metadata?.tableName || qrCode.tableId,
            zone: qrCode.zone
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetTableStatus = async (req, res) => {
    try {
        const { tableId } = req.body;
        if (!tableId) return res.status(400).json({ message: 'Table ID is required' });

        const qrCode = await QRCode.findOne({ tableId });
        if (!qrCode) return res.status(404).json({ message: 'Table not found' });

        // Reset scan status
        qrCode.lastScanned = null;
        await qrCode.save();

        // ALSO: Mark any active orders for this table as completed to truly free it
        const Order = require('../models/Order'); // Lazy load or move to top
        await Order.updateMany(
            { tableNo: tableId, status: { $nin: ['completed', 'cancelled'] } },
            { $set: { status: 'completed' } }
        );

        // Emit Socket Event to update clients immediately
        const io = req.app.get('io');
        if (io) {
            io.emit('table:freed', { tableId });
            io.emit('order:update', { tableId }); // Trigger refetch of orders too
        }

        res.json({ message: 'Table marked as free and orders closed', tableId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getQRCodes, createQRCode, deleteQRCode, verifyScan, resetTableStatus };
