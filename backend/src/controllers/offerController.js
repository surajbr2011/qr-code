const Offer = require('../models/Offer');

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
const getActiveOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single offer by ID
// @route   GET /api/offers/:id
// @access  Public
const getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (offer) {
            res.json(offer);
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = async (req, res) => {
    try {
        const { title, description, discount, validUntil, imageUrl } = req.body;

        if (!title || !discount || !validUntil || !imageUrl) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const offer = new Offer({
            title,
            description,
            discount,
            validUntil,
            imageUrl
        });

        const createdOffer = await offer.save();

        // Emit Socket Event
        const io = req.app.get('io');
        io.emit('offer:new', createdOffer);

        res.status(201).json(createdOffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (offer) {
            await offer.deleteOne();
            res.json({ message: 'Offer removed' });
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = async (req, res) => {
    try {
        console.log("updateOffer hit with ID:", req.params.id);
        console.log("Body:", req.body);
        const { title, description, discount, validUntil, imageUrl, promoCode } = req.body;
        const offer = await Offer.findById(req.params.id);

        if (offer) {
            offer.title = title || offer.title;
            offer.description = description || offer.description;
            offer.discount = discount || offer.discount;
            offer.validUntil = validUntil || offer.validUntil;
            offer.imageUrl = imageUrl || offer.imageUrl;

            const updatedOffer = await offer.save();
            res.json(updatedOffer);
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getActiveOffers, getOfferById, createOffer, deleteOffer, updateOffer };
