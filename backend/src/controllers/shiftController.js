const Shift = require('../models/Shift');
const Order = require('../models/Order');

exports.startShift = async (req, res) => {
    try {
        const { openingCash, notes } = req.body;

        // Check if there's already an open shift
        const activeShift = await Shift.findOne({ status: 'open' });
        if (activeShift) {
            return res.status(400).json({ message: "A shift is already open. Please close it first." });
        }

        const newShift = new Shift({
            openingCash,
            notes,
            adminId: req.user.id // Assuming admin is starting the shift
        });

        await newShift.save();
        res.status(201).json(newShift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getActiveShift = async (req, res) => {
    try {
        const activeShift = await Shift.findOne({ status: 'open' });
        if (!activeShift) {
            return res.status(200).json(null);
        }

        // Calculate current sales for the active shift
        const orders = await Order.find({
            createdAt: { $gte: activeShift.startTime },
            status: 'completed' // Only count completed orders
        });

        let cashSales = 0;
        let onlineSales = 0;

        orders.forEach(order => {
            if (order.paymentMethod === 'Cash') {
                cashSales += order.totalAmount;
            } else {
                onlineSales += order.totalAmount;
            }
        });

        const updatedShiftData = {
            ...activeShift._doc,
            cashSales,
            onlineSales,
            totalSales: cashSales + onlineSales,
            expectedCash: activeShift.openingCash + cashSales
        };

        res.status(200).json(updatedShiftData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.closeShift = async (req, res) => {
    try {
        const { closingCash, notes } = req.body;
        const activeShift = await Shift.findOne({ status: 'open' });

        if (!activeShift) {
            return res.status(404).json({ message: "No active shift found." });
        }

        // Final calculation
        const orders = await Order.find({
            createdAt: { $gte: activeShift.startTime },
            status: 'completed'
        });

        let cashSales = 0;
        let onlineSales = 0;

        orders.forEach(order => {
            if (order.paymentMethod === 'Cash') {
                cashSales += order.totalAmount;
            } else {
                onlineSales += order.totalAmount;
            }
        });

        activeShift.closingCash = closingCash;
        activeShift.cashSales = cashSales;
        activeShift.onlineSales = onlineSales;
        activeShift.totalSales = cashSales + onlineSales;
        activeShift.expectedCash = activeShift.openingCash + cashSales;
        activeShift.endTime = Date.now();
        activeShift.status = 'closed';
        if (notes) activeShift.notes = notes;

        await activeShift.save();
        res.status(200).json(activeShift);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShiftHistory = async (req, res) => {
    try {
        const shifts = await Shift.find().sort({ startTime: -1 }).limit(30);
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
