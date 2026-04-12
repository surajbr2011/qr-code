const HotelProfile = require('../models/HotelProfile');

// @desc    Get hotel profile (Create default if not exists)
// @route   GET /api/hotel
// @access  Public
const getHotelProfile = async (req, res) => {
    try {
        let profile = await HotelProfile.findOne();

        // Singleton pattern: if no profile exists, create a default one
        if (!profile) {
            profile = new HotelProfile();
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hotel profile
// @route   PUT /api/hotel
// @access  Private/Admin
const updateHotelProfile = async (req, res) => {
    try {
        const {
            name, address, contactNumber, email,
            logoUrl, currency, taxRate, serviceCharge, socialLinks,
            trinixId, outletId, ownerName
        } = req.body;

        let profile = await HotelProfile.findOne();

        if (!profile) {
            profile = new HotelProfile();
        }

        profile.name = name || profile.name;
        profile.address = address || profile.address;
        profile.contactNumber = contactNumber || profile.contactNumber;
        profile.email = email || profile.email;
        profile.logoUrl = logoUrl || profile.logoUrl;
        profile.currency = currency || profile.currency;
        profile.taxRate = taxRate !== undefined ? taxRate : profile.taxRate;
        profile.serviceCharge = serviceCharge !== undefined ? serviceCharge : profile.serviceCharge;
        profile.socialLinks = socialLinks || profile.socialLinks;

        // Identity Updates
        profile.trinixId = trinixId || profile.trinixId;
        profile.outletId = outletId || profile.outletId;
        profile.ownerName = ownerName || profile.ownerName;

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getHotelProfile, updateHotelProfile };
