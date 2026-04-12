const express = require('express');
const router = express.Router();
const { getHotelProfile, updateHotelProfile } = require('../controllers/hotelController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getHotelProfile);
router.put('/', protect, authorizeRoles('admin'), updateHotelProfile);

module.exports = router;
