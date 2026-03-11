const express = require('express');
const router = express.Router();
const { getQRCodes, createQRCode, deleteQRCode, verifyScan, resetTableStatus } = require('../controllers/qrCodeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public route for scanning
// Public route for scanning
router.post('/verify-scan', verifyScan);

// Protected route to reset table status (Mark as Free)
router.post('/reset', protect, resetTableStatus);

router.route('/')
    .get(protect, getQRCodes)
    .post(protect, authorizeRoles('admin'), createQRCode);

router.route('/:id')
    .delete(protect, authorizeRoles('admin'), deleteQRCode);

module.exports = router;
