const PromoCode = require('../models/PromoCode');

// @desc    Validate a promo code
// @route   POST /api/promocodes/validate
// @access  Public
const validatePromoCode = async (req, res) => {
    try {
        const { code, subtotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Promo code is required" });
        }

        const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) {
            return res.status(404).json({ message: "Invalid or inactive promo code" });
        }

        const now = new Date();
        if (now < new Date(promo.startDate)) {
            return res.status(400).json({ message: "Promo code is not active yet" });
        }
        if (now > new Date(promo.endDate)) {
            return res.status(400).json({ message: "Promo code has expired" });
        }

        if (subtotal < promo.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount of ₹${promo.minOrderAmount} required` });
        }

        // Calculate Discount
        let discountAmount = (subtotal * promo.discountPercent) / 100;

        // Apply Max Cap if exists
        if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
            discountAmount = promo.maxDiscountAmount;
        }

        res.json({
            success: true,
            code: promo.code,
            discountPercent: promo.discountPercent,
            discountAmount: Math.round(discountAmount), // Round to nearest integer
            message: "Promo code applied successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Create a new promo code
// @route   POST /api/promocodes
// @access  Admin
const createPromoCode = async (req, res) => {
    try {
        const { code, discountPercent, startDate, endDate, description, minOrderAmount } = req.body;

        const existing = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ message: "Promo code already exists" });
        }

        const promo = await PromoCode.create({
            code: code.toUpperCase(),
            discountPercent,
            startDate,
            endDate,
            description,
            minOrderAmount: minOrderAmount || 0
        });

        res.status(201).json(promo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get all promo codes
// @route   GET /api/promocodes
// @access  Admin
const getAllPromoCodes = async (req, res) => {
    try {
        const promos = await PromoCode.find({}).sort({ createdAt: -1 });
        res.json(promos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete a promo code
// @route   DELETE /api/promocodes/:id
// @access  Admin
const deletePromoCode = async (req, res) => {
    try {
        const promo = await PromoCode.findById(req.params.id);
        if (!promo) {
            return res.status(404).json({ message: "Promo code not found" });
        }

        await promo.deleteOne();
        res.json({ message: "Promo code removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    validatePromoCode,
    createPromoCode,
    getAllPromoCodes,
    deletePromoCode
};
